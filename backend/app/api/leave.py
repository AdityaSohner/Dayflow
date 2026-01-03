from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_leave():
    return {"message": "Leave API"}
