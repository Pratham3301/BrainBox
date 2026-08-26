import os
import sys

try:
    from huggingface_hub import HfApi
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub"])
    from huggingface_hub import HfApi

token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_HUB_TOKEN")
if not token:
    raise RuntimeError("Set HF_TOKEN or HUGGINGFACE_HUB_TOKEN before uploading.")

api = HfApi(token=token)
repo_id = "Pratham0100/BrainBox-Backend"

files_to_upload = [
    "app.py",
    "requirements.txt",
    "Dockerfile",
    "pyproject.toml",
    "README.md"
]
folders_to_upload = [
    "backend",
    "src"
]

print("Uploading files to Hugging Face...")

for file in files_to_upload:
    if os.path.exists(file):
        print(f"Uploading {file}...")
        api.upload_file(
            path_or_fileobj=file,
            path_in_repo=file,
            repo_id=repo_id,
            repo_type="space",
            token=token
        )

for folder in folders_to_upload:
    if os.path.exists(folder):
        print(f"Uploading folder {folder}...")
        api.upload_folder(
            folder_path=folder,
            path_in_repo=folder,
            repo_id=repo_id,
            repo_type="space",
            token=token
        )

print("Upload to Hugging Face Spaces completed successfully!")

try:
    print("Forcing hardware downgrade to CPU Basic...")
    api.request_space_hardware(repo_id=repo_id, hardware="cpu-basic")
    print("Hardware downgraded successfully!")
except Exception as e:
    print(f"Hardware downgrade failed: {e}")
