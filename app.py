import os
import sys

import gradio as gr
import spaces

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from backend.main import app as fastapi_app


@spaces.GPU
def reserve_gpu():
    """Optional manual ZeroGPU reservation for the Space control surface."""
    return "GPU reservation is ready. API requests continue on the Space CPU."


with gr.Blocks() as demo:
    gr.Markdown("# BrainBox Backend\nThe FastAPI service is ready at `/api/*`.")
    status = gr.Textbox(label="Space status", interactive=False)
    gr.Button("Reserve ZeroGPU").click(reserve_gpu, outputs=status)

# Mount Gradio using its public API.  This preserves the existing FastAPI routes
# instead of monkey-patching Gradio's internal router.
app = gr.mount_gradio_app(fastapi_app, demo, path="/ui")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "7860")))
