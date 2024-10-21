from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

# Serve front-end page
@app.get("/")
async def get():
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())
