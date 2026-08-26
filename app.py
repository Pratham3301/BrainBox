import os
import sys

import gradio as gr
import spaces
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from backend.main import app as fastapi_app


@spaces.GPU
def fake_gpu():
    pass


with gr.Blocks() as demo:
    gr.Markdown("BrainBox Backend is Running natively inside Gradio!")
    btn = gr.Button("ZeroGPU Keepalive")
    btn.click(fn=fake_gpu, inputs=[], outputs=[])


# This follows the deployment shape already used by the ZeroGPU Space. The
# FastAPI app owns the API routes; Gradio supplies the Space process/UI shell.
original_init = gr.routes.App.__init__


def custom_init(self, *args, **kwargs):
    original_init(self, *args, **kwargs)
    # Gradio owns a generic `/api/{api_name}` route.  A mounted FastAPI app at
    # `/api` becomes `/api/api/...` and is intercepted before it can run. Put
    # the exact backend API routes ahead of Gradio's generic route instead.
    backend_routes = [
        route for route in fastapi_app.router.routes
        if route.path.startswith("/api/")
    ]
    self.router.routes[0:0] = backend_routes
    self.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )


gr.routes.App.__init__ = custom_init


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
