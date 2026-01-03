from pydantic import BaseModel
from datetime import date

class LeaveApplyRequest(BaseModel):
    leave_type: str          # paid | sick | unpaid
    start_date: date
    end_date: date
