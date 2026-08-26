import os
import sys

import gradio as gr
import spaces

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from backend.main import app as fastapi_app


@spaces.GPU
def fake_gpu():
    pass


with gr.Blocks() as demo:
    gr.Markdown("BrainBox Backend is Running natively inside Gradio!")
    btn = gr.Button("ZeroGPU Keepalive")
    btn.click(fn=fake_gpu, inputs=[], outputs=[])


original_init = gr.routes.App.__init__


def custom_init(self, *args, **kwargs):
    original_init(self, *args, **kwargs)
    self.mount("/api", fastapi_app)


gr.routes.App.__init__ = custom_init


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", "7860")))
