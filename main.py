from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/script", StaticFiles(directory="script"), name="script")


# Serve front-end page
@app.get("/")
async def get():
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())
