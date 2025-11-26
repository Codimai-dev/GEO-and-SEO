from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from dotenv import load_dotenv
import os
import traceback

load_dotenv()

from .database import init_db, get_session
from .models import User, Report
from .schemas import UserCreate, UserRead, Token, ReportCreate, ReportRead
from .auth import hash_password, verify_password, create_access_token
from .validator import validate_url

app = FastAPI(title="Codimai Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and common dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# ---------------- USER AUTH ----------------

@app.post("/signup", response_model=UserRead)
def signup(data: UserCreate, db: Session = Depends(get_session)):
    try:
        exists = db.exec(select(User).where(User.email == data.email)).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        print(f"Error during signup: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_session)):

    user = db.exec(select(User).where(User.email == form.username)).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# ---------------- REPORTS ----------------

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .auth import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user

# ---------------- REPORTS ----------------

@app.post("/reports", response_model=ReportRead)
def create_report(data: ReportCreate,
                  current_user: User = Depends(get_current_user),
                  db: Session = Depends(get_session)):
    validate_url(data.url)

    report = Report(
        title=data.title,
        url=data.url,
        payload=data.payload,
        owner_id=current_user.id
    )

    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@app.get("/reports", response_model=list[ReportRead])
def get_reports(current_user: User = Depends(get_current_user),
                db: Session = Depends(get_session)):
    return db.exec(select(Report).where(Report.owner_id == current_user.id)).all()
