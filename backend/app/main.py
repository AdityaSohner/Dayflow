from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth,employees,attendance,leave,payroll,reports


app = FastAPI(title="Dayflow HRMS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(employees.router,prefix="/employees",tags=["Employees"])
app.include_router(attendance.router,prefix="/attendance",tags=["Attendance"])
app.include_router(leave.router,prefix="/leave",tags=["Leave"])
app.include_router(payroll.router,prefix="/payroll",tags=["Payroll"])
app.include_router(reports.router,prefix="/reports",tags=["Reports"])


@app.get("/")
def root():
    return {"message": "Dayflow HRMS API running"}


