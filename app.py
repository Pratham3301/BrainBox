import os
import sys

import gradio as gr
import spaces
from starlette.routing import Mount

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from backend.main import app as fastapi_app


@spaces.GPU
def reserve_zero_gpu():
    return "ZeroGPU ready"


with gr.Blocks() as demo:
    gr.Markdown("# BrainBox backend")
    status = gr.Textbox(label="Status", interactive=False)
    gr.Button("Reserve ZeroGPU").click(reserve_zero_gpu, outputs=status)


# Gradio reserves `/api/*` for its own prediction endpoints.  Mounting the
# FastAPI service at `/backend` prevents that collision: frontend routes are
# served as `/backend/api/...`.
original_init = gr.routes.App.__init__


def custom_init(self, *args, **kwargs):
    original_init(self, *args, **kwargs)
    # Gradio has a catch-all route.  The backend mount must be first so the
    # catch-all cannot claim `/backend/api/*` before FastAPI sees it.
    self.router.routes.insert(0, Mount("/backend", app=fastapi_app))


gr.routes.App.__init__ = custom_init


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", "7860")))
