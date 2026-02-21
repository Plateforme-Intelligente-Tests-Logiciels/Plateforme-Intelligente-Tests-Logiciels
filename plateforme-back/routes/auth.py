from datetime import timedelta, datetime
import os
from typing import Annotated

from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status

from db.database import get_db
from models.user import Utilisateur

# ================= CONFIG =================
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/sign_in")

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# ================= SCHEMAS =================
class CreateUserRequest(BaseModel):
    nom: str
    email: str
    motDePasse: str
    telephone: str | None = None
    role_id: int | None = None   # role optionnel

class Token(BaseModel):
    access_token: str
    token_type: str

db_dependency = Annotated[Session, Depends(get_db)]

# ================= SIGN UP =================
@router.post("/sign_up", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, request: CreateUserRequest):
    # Check email unique
    existing_user = db.query(Utilisateur).filter(Utilisateur.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà utilisé"
        )

    # bcrypt limite 72 bytes
    password = request.motDePasse[:72]

    new_user = Utilisateur(
        nom=request.nom,
        email=request.email,
        motDePasse=bcrypt_context.hash(password),
        telephone=request.telephone,
        role_id=request.role_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Utilisateur créé avec succès",
        "user_id": new_user.id,
        "role_id": new_user.role_id
    }

# ================= AUTH =================
def authenticate_user(email: str, password: str, db: db_dependency):
    user = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if not user:
        return False

    # même fix 72 bytes
    password = password[:72]

    if not bcrypt_context.verify(password, user.motDePasse):
        return False
    return user

def create_access_token(user_id: int, expires_delta: timedelta):
    encode = {"sub": str(user_id)}
    expire = datetime.utcnow() + expires_delta
    encode.update({"exp": expire})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

# ================= SIGN IN =================
@router.post("/sign_in", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(),
                db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    token = create_access_token(user.id, timedelta(days=30))
    return {"access_token": token, "token_type": "bearer"}

# ================= CURRENT USER =================
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

@router.get("/me")
async def get_me(db: db_dependency, user_id: Annotated[int, Depends(get_current_user)]):
    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {
        "id": user.id,
        "nom": user.nom,
        "email": user.email,
        "telephone": user.telephone,
        "role_id": user.role_id
    }