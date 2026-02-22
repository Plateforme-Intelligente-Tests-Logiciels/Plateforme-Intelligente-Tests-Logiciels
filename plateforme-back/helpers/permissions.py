from functools import wraps
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from db.database import get_db
from models.user import Utilisateur, Role, Permission
from routes.auth import get_current_user


# ================= CONSTANTES RÔLES =================
ROLE_SUPER_ADMIN = "SUPER_ADMIN"
ROLE_PRODUCT_OWNER = "PRODUCT_OWNER"
ROLE_SCRUM_MASTER = "SCRUM_MASTER"
ROLE_DEVELOPPEUR = "DEVELOPPEUR"
ROLE_TESTEUR_QA = "TESTEUR_QA"

# Niveaux d'accès (du plus élevé au plus bas)
NIVEAU_SUPER_ADMIN = 100
NIVEAU_PRODUCT_OWNER = 80
NIVEAU_SCRUM_MASTER = 70
NIVEAU_TESTEUR_QA = 60
NIVEAU_DEVELOPPEUR = 50


# ================= DÉPENDANCES =================
async def get_current_user_with_role(
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user)]
) -> Utilisateur:
    """Récupère l'utilisateur courant avec son rôle et permissions"""
    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    if not user.actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur désactivé"
        )
    return user


def require_role(*allowed_roles: str):
    """Décorateur pour vérifier si l'utilisateur a un des rôles requis"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Récupérer l'utilisateur depuis les kwargs (injecté par FastAPI)
            user = kwargs.get('current_user')
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentification requise"
                )
            
            if not user.role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Aucun rôle attribué"
                )
            
            if user.role.code not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Rôle insuffisant. Rôles requis: {', '.join(allowed_roles)}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_permission(resource: str, action: str):
    """Décorateur pour vérifier si l'utilisateur a une permission spécifique"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('current_user')
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentification requise"
                )
            
            if not user.role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Aucun rôle attribué"
                )
            
            # Super Admin a toutes les permissions
            if user.role.code == ROLE_SUPER_ADMIN:
                return await func(*args, **kwargs)
            
            # Vérifier si la permission existe dans le rôle
            has_permission = any(
                p.resource == resource and p.action == action
                for p in user.role.permissions
            )
            
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission requise: {action} sur {resource}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_min_level(min_level: int):
    """Décorateur pour vérifier le niveau d'accès minimum"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('current_user')
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentification requise"
                )
            
            if not user.role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Aucun rôle attribué"
                )
            
            if user.role.niveau_acces < min_level:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Niveau d'accès insuffisant (requis: {min_level})"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# ================= HELPERS =================
def check_user_has_permission(user: Utilisateur, resource: str, action: str) -> bool:
    """Vérifie si un utilisateur a une permission donnée"""
    if not user.role:
        return False
    
    # Super Admin a toutes les permissions
    if user.role.code == ROLE_SUPER_ADMIN:
        return True
    
    return any(
        p.resource == resource and p.action == action
        for p in user.role.permissions
    )


def check_user_has_role(user: Utilisateur, *role_codes: str) -> bool:
    """Vérifie si un utilisateur a un des rôles spécifiés"""
    if not user.role:
        return False
    return user.role.code in role_codes
