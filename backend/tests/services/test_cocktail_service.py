import pytest
from app.services.cocktail_service import CocktailService
from datetime import datetime

@pytest.mark.services
class TestCocktailService:
    def test_get_all_cocktails_anonymous(self, session, approved_cocktail):
        cocktails = CocktailService.get_all_cocktails(user_id=None)
        assert len(cocktails) > 0
        for cocktail in cocktails:
            assert cocktail['status'] == 'approved'

    def test_get_all_cocktails_authenticated(self, session, approved_cocktail, sample_cocktail, regular_user):
        cocktails = CocktailService.get_all_cocktails(user_id=regular_user.id)
        cocktail_names = [c['name'] for c in cocktails]
        assert 'Official Cocktail' in cocktail_names
        assert 'Test Martini' in cocktail_names

    def test_get_cocktail_by_id_approved(self, session, approved_cocktail):
        cocktail = CocktailService.get_cocktail_by_id(approved_cocktail.id)
        assert cocktail is not None
        assert cocktail['name'] == 'Official Cocktail'
        assert cocktail['status'] == 'approved'

    def test_get_cocktail_by_id_own_private(self, session, sample_cocktail, regular_user):
        cocktail = CocktailService.get_cocktail_by_id(
            sample_cocktail.id,
            user_id=regular_user.id
        )
        assert cocktail is not None
        assert cocktail['name'] == 'Test Martini'
        assert cocktail['status'] == 'private'

    def test_get_cocktail_by_id_other_user_private(self, session, sample_cocktail, second_user):
        cocktail = CocktailService.get_cocktail_by_id(
            sample_cocktail.id,
            user_id=second_user.id
        )
        assert cocktail is None

    def test_get_cocktail_by_id_admin_access(self, session, sample_cocktail, admin_user):
        cocktail = CocktailService.get_cocktail_by_id(
            sample_cocktail.id,
            user_id=admin_user.id
        )
        assert cocktail is not None
        assert cocktail['name'] == 'Test Martini'

    def test_create_cocktail(self, session, regular_user, sample_ingredient):
        data = {
            'name': 'New Cocktail',
            'description': 'A new test cocktail',
            'instructions': 'Mix and serve',
            'difficulty': 'Easy',
            'glass_type': 'Rocks Glass',
            'garnish': 'Lemon twist',
            'servings': 1,
            'user_id': regular_user.id,
            'ingredients': [
                {'ingredient_id': sample_ingredient.id, 'quantity': '2 oz'}
            ]
        }
        cocktail = CocktailService.create_cocktail(data)
        assert cocktail.id is not None
        assert cocktail.name == 'New Cocktail'
        assert cocktail.status == 'private'
        assert cocktail.user_id == regular_user.id
    def test_create_cocktail_validation(self, session, regular_user):
        with pytest.raises(ValueError, match="name is required"):
            CocktailService.create_cocktail({
                'instructions': 'Mix',
                'user_id': regular_user.id,
                'ingredients': []
            })
        with pytest.raises(ValueError, match="Instructions are required"):
            CocktailService.create_cocktail({
                'name': 'Test',
                'user_id': regular_user.id,
                'ingredients': []
            })
        with pytest.raises(ValueError, match="ingredient is required"):
            CocktailService.create_cocktail({
                'name': 'Test',
                'instructions': 'Mix',
                'user_id': regular_user.id,
                'ingredients': []
            })

    def test_update_cocktail(self, session, sample_cocktail, regular_user):
        data = {
            'name': 'Updated Martini',
            'description': 'Updated description',
            'difficulty': 'Advanced'
        }
        updated = CocktailService.update_cocktail(
            sample_cocktail.id,
            data,
            regular_user.id
        )
        assert updated.name == 'Updated Martini'
        assert updated.description == 'Updated description'
        assert updated.difficulty == 'Advanced'

    def test_update_cocktail_unauthorized(self, session, sample_cocktail, second_user):
        data = {'name': 'Hacked Name'}
        with pytest.raises(ValueError, match="permission"):
            CocktailService.update_cocktail(
                sample_cocktail.id,
                data,
                second_user.id
            )

    def test_delete_cocktail(self, session, sample_cocktail, regular_user):
        from app.models import Cocktail
        cocktail_id = sample_cocktail.id
        result = CocktailService.delete_cocktail(cocktail_id, regular_user.id)
        assert result
        deleted = session.get(Cocktail, cocktail_id)
        assert deleted is None

    def test_delete_cocktail_unauthorized(self, session, sample_cocktail, second_user):
        with pytest.raises(ValueError, match="permission"):
            CocktailService.delete_cocktail(sample_cocktail.id, second_user.id)

    def test_submit_for_review(self, session, sample_cocktail, regular_user):
        result = CocktailService.submit_for_review(
            sample_cocktail.id,
            regular_user.id
        )
        assert result['status'] == 'pending'
        assert result['submitted_at'] is not None

    def test_submit_for_review_already_pending(self, session, sample_cocktail, regular_user):
        sample_cocktail.status = 'pending'
        session.commit()
        with pytest.raises(ValueError):
            CocktailService.submit_for_review(
                sample_cocktail.id,
                regular_user.id
            )

    def test_approve_cocktail(self, session, sample_cocktail, admin_user, regular_user):
        sample_cocktail.status = 'pending'
        session.commit()
        result = CocktailService.approve_cocktail(
            sample_cocktail.id,
            admin_user.id
        )
        assert result['status'] == 'approved'
        assert result['reviewed_at'] is not None
        assert result['reviewed_by'] == admin_user.id

    def test_reject_cocktail(self, session, sample_cocktail, admin_user):
        sample_cocktail.status = 'pending'
        session.commit()
        result = CocktailService.reject_cocktail(
            sample_cocktail.id,
            admin_user.id,
            'Missing ingredient quantities'
        )
        assert result['status'] == 'rejected'
        assert result['rejection_reason'] == 'Missing ingredient quantities'
        assert result['reviewed_at'] is not None

    def test_resubmit_rejected_cocktail(self, session, sample_cocktail, regular_user):
        sample_cocktail.status = 'rejected'
        sample_cocktail.rejection_reason = 'Fix this'
        session.commit()
        result = CocktailService.submit_for_review(
            sample_cocktail.id,
            regular_user.id
        )
        assert result['status'] == 'pending'
        assert result['rejection_reason'] is None

    def test_get_pending_cocktails(self, session, sample_cocktail, admin_user):
        sample_cocktail.status = 'pending'
        sample_cocktail.submitted_at = datetime.utcnow()
        session.commit()
        pending = CocktailService.get_pending_cocktails()
        assert len(pending) > 0
        assert any(c['id'] == sample_cocktail.id for c in pending)

    def test_get_user_cocktails(self, session, sample_cocktail, regular_user):
        result = CocktailService.get_user_cocktails(regular_user.id)
        assert 'private' in result
        assert 'pending' in result
        assert 'approved' in result
        assert 'rejected' in result
        assert len(result['private']) > 0
