import os
import sys

import gradio as gr
import spaces

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


class BackendDispatchMiddleware:
    """Pass the backend prefix to FastAPI before Gradio routes the request."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        path = scope.get("path", "")
        if scope["type"] in {"http", "websocket"} and (
            path == "/backend" or path.startswith("/backend/")
        ):
            backend_scope = dict(scope)
            backend_scope["path"] = path[len("/backend"):] or "/"
            backend_scope["root_path"] = f"{scope.get('root_path', '')}/backend"
            await fastapi_app(backend_scope, receive, send)
            return
        await self.app(scope, receive, send)


def custom_init(self, *args, **kwargs):
    original_init(self, *args, **kwargs)
    self.add_middleware(BackendDispatchMiddleware)


gr.routes.App.__init__ = custom_init


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", "7860")))
