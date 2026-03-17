"""structured quantities and preferred unit

Revision ID: 09cf65c38d65
Revises: ce1e898e80b6
Create Date: 2026-03-17 17:34:39.308639

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '09cf65c38d65'
down_revision = 'ce1e898e80b6'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('cocktail_ingredients', schema=None) as batch_op:
        batch_op.alter_column('quantity',
            existing_type=sa.String(length=50),
            type_=sa.Float(),
            nullable=True)
        batch_op.add_column(sa.Column('unit', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('quantity_note', sa.String(length=100), nullable=True))

    with op.batch_alter_table('ingredient', schema=None) as batch_op:
        batch_op.add_column(sa.Column('preferred_unit', sa.String(length=20), nullable=True))

def downgrade():
    with op.batch_alter_table('ingredient', schema=None) as batch_op:
        batch_op.drop_column('preferred_unit')

    with op.batch_alter_table('cocktail_ingredients', schema=None) as batch_op:
        batch_op.drop_column('quantity_note')
        batch_op.drop_column('unit')
        batch_op.alter_column('quantity',
            existing_type=sa.Float(),
            type_=sa.String(length=50),
            nullable=True)

    # ### end Alembic commands ###
