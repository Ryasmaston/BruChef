# 🍸 BruChef - Bartender Companion Application

A full-stack web application for managing cocktails, tracking bar inventory, and discovering what drinks you can make with the ingredients you have on hand.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Key Features Deep Dive](#-key-features-deep-dive)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [Support](#-support)

---

## ✨ Features

### Cocktail Management
- Browse and search through a comprehensive cocktail database
- Create and share your own cocktail recipes
- Advanced filtering by spirit type, difficulty, and ingredients
- Dynamic serving size adjustment with automatic quantity scaling
- Step-by-step instructions builder
- Support for standard and approximate measurements (oz, ml, dash, splash, drop)
- Community submission and admin approval system

### Inventory Tracking
- Manage your personal bar inventory
- Add ingredients with volume, mass, or count measurements
- Multi-unit conversion system (ml, oz, g, lb, pieces, etc.)
- Automatic cocktail feasibility checking
- See which cocktails you can make with current inventory
- One-click "Make Cocktail" feature with automatic inventory deduction

### User Features
- User registration and authentication
- Personal cocktail creation and management
- Recipe submission workflow (Private → Pending → Approved/Rejected)
- "My Recipes" dashboard showing all user cocktails by status
- Edit and delete own cocktails and ingredients

### Admin Features
- Review pending cocktail submissions
- Approve or reject recipes with feedback
- Full edit/delete permissions on all content
- Manage ingredients and categories

### Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark theme with emerald accents
- Interactive ingredient search and filtering
- Custom confirmation dialogs and alerts
- Real-time validation and feedback
- Intuitive category icons and visual indicators

---

## 🛠 Tech Stack

### **Frontend**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### **Backend**
- **Flask** - Python web framework
- **SQLAlchemy** - ORM
- **Flask-Migrate** - Database migrations
- **PostgreSQL** - Primary database
- **Flask-CORS** - Cross-origin resource sharing
- **Werkzeug** - Password hashing

### **Development Tools**
- **Git** - Version control
- **npm** - Package management (frontend)
- **pip** - Package management (backend)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** and **npm** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/downloads)

---

## 🚀 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/bruchef.git
cd bruchef
```

### **2. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### **3. Frontend Setup**

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

---

## 🗄 Database Setup

### **1. Create PostgreSQL Database**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bruchef;

# Exit PostgreSQL
\q
```

### **2. Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bruchef

# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:5173
```

### **3. Initialize Database**

```bash
# From backend directory with virtual environment activated
cd backend

# Initialize migrations
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade

# Seed database with sample data
python seed.py
```

---

## ▶️ Running the Application

### **1. Start Backend Server**

```bash
# From backend directory with virtual environment activated
cd backend
python run.py
```

The backend will run on `http://localhost:5001`

### **2. Start Frontend Development Server**

```bash
# From frontend directory (in a new terminal)
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### **3. Access the Application**

Open your browser and navigate to: `http://localhost:5173`

---

## 👥 User Roles & Permissions

### **Regular Users**
- ✅ Create and manage personal cocktails
- ✅ Submit cocktails for community approval
- ✅ View approved cocktails
- ✅ Manage personal inventory
- ✅ Create custom ingredients
- ✅ Edit/delete own cocktails and ingredients
- ❌ Cannot view other users' private cocktails
- ❌ Cannot approve/reject submissions

### **Admin Users**
- ✅ All regular user permissions
- ✅ Review pending cocktail submissions
- ✅ Approve or reject with feedback
- ✅ View all cocktails regardless of status
- ✅ Edit/delete any cocktail or ingredient
- ✅ Access admin review dashboard

### **Permission Matrix**

| Action | Public | Logged in | Admin |
|--------|---------|-------|--------|
| View approved cocktails | ✅ | ✅ | ✅ |
| View approved ingredients | ✅ | ✅ | ✅ |
| View own private cocktails | ❌ | ✅ | ✅ |
| View all private cocktails | ❌ | ❌ | ✅ |
| Create cocktail | ❌ | ✅ | ✅ |
| Edit own cocktail | ❌ | ✅ | ✅ |
| Edit any cocktail | ❌ | ❌ | ✅ |
| Delete own cocktail | ❌ | ✅ | ✅ |
| Delete any cocktail | ❌ | ❌ | ✅ |
| Submit for review | ❌ | ✅ | ✅ |
| Approve/reject | ❌ | ❌ | ✅ |
| Create ingredient | ❌ | ✅ | ✅ |
| Edit own ingredient | ❌ | ✅ | ✅ |
| Edit any ingredient | ❌ | ❌ | ✅ |

---

## 🔌 API Documentation

### **Authentication**

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### Check Auth Status
```http
GET /api/auth/check
```

#### Logout
```http
POST /api/auth/logout
```

---

### **Cocktails**

#### Get All Cocktails
```http
GET /api/cocktails/
```
Returns approved cocktails + user's own cocktails if authenticated.

#### Get Cocktail by ID
```http
GET /api/cocktails/:id
```

#### Create Cocktail
```http
POST /api/cocktails/
Authorization: Required
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "instructions": "string",
  "difficulty": "Easy|Medium|Advanced",
  "glass_type": "string",
  "garnish": "string",
  "servings": number,
  "ingredients": [
    {
      "ingredient_id": number,
      "quantity": "string"  // e.g., "2 oz", "3 dashes", "top with"
    }
  ]
}
```

#### Update Cocktail
```http
PUT /api/cocktails/:id
Authorization: Required
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "instructions": "string",
  "difficulty": "string",
  "glass_type": "string",
  "garnish": "string",
  "servings": number,
  "ingredients": [...]
}
```

#### Delete Cocktail
```http
DELETE /api/cocktails/:id
Authorization: Required
```

#### Submit for Review
```http
POST /api/cocktails/submit/:id
Authorization: Required
```

#### Get Pending Cocktails (Admin)
```http
GET /api/cocktails/pending
Authorization: Required (Admin)
```

#### Approve Cocktail (Admin)
```http
POST /api/cocktails/approve/:id
Authorization: Required (Admin)
```

#### Reject Cocktail (Admin)
```http
POST /api/cocktails/reject/:id
Authorization: Required (Admin)
Content-Type: application/json

{
  "reason": "string"
}
```

#### Get User's Cocktails
```http
GET /api/cocktails/my-cocktails
Authorization: Required
```

---

### **Ingredients**

#### Get All Ingredients
```http
GET /api/ingredients/
```

#### Get Ingredient by ID
```http
GET /api/ingredients/:id
```

#### Create Ingredient
```http
POST /api/ingredients/
Authorization: Required
Content-Type: application/json

{
  "name": "string",
  "category": "string",
  "subcategory": "string",
  "abv": number,
  "description": "string"
}
```

#### Update Ingredient
```http
PUT /api/ingredients/:id
Authorization: Required
Content-Type: application/json

{
  "name": "string",
  "category": "string",
  "subcategory": "string",
  "abv": number,
  "description": "string"
}
```

#### Delete Ingredient
```http
DELETE /api/ingredients/:id
Authorization: Required
```

---

### **Inventory**

#### Get User Inventory
```http
GET /api/inventory/
Authorization: Required
```

#### Add to Inventory
```http
POST /api/inventory/
Authorization: Required
Content-Type: application/json

{
  "ingredient_id": number,
  "quantity": number,
  "unit": "string",
  "notes": "string"
}
```

#### Remove from Inventory
```http
DELETE /api/inventory/:id
Authorization: Required
```

#### Get Available Cocktails
```http
GET /api/inventory/available-cocktails
Authorization: Required
```
Returns cocktails the user can make with their current inventory.

#### Get Missing Ingredients
```http
GET /api/inventory/missing/:cocktail_id?servings=1
Authorization: Required
```

#### Make Cocktail (Deduct from Inventory)
```http
POST /api/inventory/make-cocktail/:cocktail_id
Authorization: Required
Content-Type: application/json

{
  "servings": number
}
```

---

## 🔑 Key Features Deep Dive

### **Multi-Unit Conversion System**

The application supports comprehensive unit conversions for ingredients:

**Volume Units:**
- ml (milliliters)
- oz (fluid ounces)
- l (liters)
- cl (centiliters)
- cup, tsp, tbsp
- dash, splash, drop (approximate measurements)

**Mass Units:**
- g (grams)
- kg (kilograms)
- lb (pounds)
- oz (weight)

**Count Units:**
- pieces, cubes, leaves, slices, wedges
- bottles, cans, eggs

**Conversions:**
```python
# Example conversions in unit_conversion.py
VOLUME_CONVERSIONS = {
    'ml': 1,
    'oz': 29.5735,
    'dash': 0.616,
    'splash': 7.5,
    'drop': 0.05,
    # ...
}
```

---

### **Cocktail Approval Workflow**

```
┌─────────────┐
│   Private   │ ← User creates cocktail
└──────┬──────┘
       │
       │ User clicks "Submit for Review"
       ↓
┌─────────────┐
│   Pending   │ ← Awaiting admin review
└──────┬──────┘
       │
       ├─── Admin approves ───→ ┌──────────┐
       │                        │ Approved │ ← Visible to everyone
       │                        └──────────┘
       │
       └─── Admin rejects ───→ ┌──────────┐
                                │ Rejected │ ← Back to creator with feedback
                                └────┬─────┘
                                     │
                                     │ Creator can fix and resubmit
                                     ↓
                                ┌─────────┐
                                │ Pending │
                                └─────────┘
```

---

### **Inventory-Based Cocktail Matching**

The system automatically determines which cocktails you can make:

1. **User adds ingredients** to their inventory with quantities
2. **System standardizes** all units to base units (ml for volume, g for mass)
3. **For each cocktail**, system checks if user has sufficient quantities
4. **Only shows cocktails** where ALL required ingredients are available
5. **"Make Cocktail" feature** deducts used quantities from inventory

**Example:**
```
User Inventory:
- Vodka: 750 ml
- Triple Sec: 500 ml
- Lime Juice: 250 ml

Cosmopolitan Recipe (per serving):
- Vodka: 45 ml (1.5 oz)
- Triple Sec: 15 ml (0.5 oz)
- Lime Juice: 15 ml (0.5 oz)

✅ Can make: Yes (10 servings possible)

After making 2 servings:
- Vodka: 660 ml (750 - 90)
- Triple Sec: 470 ml (500 - 30)
- Lime Juice: 220 ml (250 - 30)
```

---

### **Dynamic Ingredient Quantity Scaling**

Cocktails can be scaled for different serving sizes:

- **Base recipe** stored with default servings (e.g., 1 serving)
- **User selects** number of servings (1-20)
- **Quantities automatically scaled** proportionally
- **Approximate measurements** (dash, splash) also scale

**Example:**
```
Mojito (1 serving):
- White Rum: 2 oz
- Lime Juice: 1 oz
- Simple Syrup: 0.5 oz
- Mint Leaves: 10 leaves
- Soda Water: top with

Mojito (4 servings):
- White Rum: 8 oz
- Lime Juice: 4 oz
- Simple Syrup: 2 oz
- Mint Leaves: 40 leaves
- Soda Water: top with
```

---

### **Advanced Filtering System**

**Cocktails Page Filters:**
- 🔍 **Search by name or ingredient** - Real-time text search
- 🥃 **Spirit filter** - Filter by base spirit (Vodka, Gin, Rum, etc.)
- 📊 **Difficulty filter** - Easy, Medium, Advanced
- 🏷️ **Active filter tags** - Visual indicator of applied filters
- ↕️ **Sort options** - Alphabetical, difficulty, newest

**Ingredients Page Filters:**
- 🔍 **Search by name** - Real-time text search
- 📂 **Category filter** - Spirit, Liqueur, Juice, etc.
- 🏷️ **Subcategory filter** - Dynamic based on category selection

---

### **Step-by-Step Instruction Builder**

When creating/editing cocktails:

1. **Add instruction** - Type step and click "Add Step" or press Ctrl+Enter
2. **Edit step** - Click ✏️ to edit, updates in place
3. **Reorder steps** - Use ↑↓ arrows to move steps up/down
4. **Delete step** - Click 🗑️ to remove
5. **Visual feedback** - Currently editing step highlighted in green
6. **Auto-numbering** - Steps automatically numbered

---

## 🧪 Test Accounts

The `seed.py` script creates these test accounts:

### **Admin Account**
```
Username: admin
Password: admin123
```

### **Regular User Accounts**
```
Username: Alice
Password: Password123

Username: John
Password: Password123
```

---

## 🐛 Troubleshooting

### **Database Connection Issues**

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify database exists
psql -U postgres -l | grep bruchef

# Reset database (WARNING: deletes all data)
flask db downgrade
flask db upgrade
python seed.py
```

### **CORS Issues**

Ensure backend `.env` has:
```env
CORS_ORIGINS=http://localhost:5173
```

And `backend/app/__init__.py` has:
```python
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])
```

### **Session/Authentication Issues**

```bash
# Clear browser cookies for localhost:5173
# Restart both backend and frontend servers
```

### **Port Already in Use**

```bash
# Kill process on port 5001 (backend)
# On macOS/Linux:
lsof -ti:5001 | xargs kill -9
# On Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Kill process on port 5173 (frontend)
# On macOS/Linux:
lsof -ti:5173 | xargs kill -9
# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 🔜 Future Enhancements

- [ ] Image uploads for cocktails
- [ ] User profiles with avatars
- [ ] Cocktail ratings and reviews
- [ ] Favorite cocktails
- [ ] Shopping list generation
- [ ] Cocktail recommendations based on taste preferences
- [ ] Social features (follow users, share recipes)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Recipe variations and alternatives
- [ ] Ingredient substitution suggestions
- [ ] Print-friendly recipe cards
- [ ] Export recipes to PDF

---

## 📞 Support

For support, email ryan@osmaston.me or open an issue on GitHub.

---

**Made with ❤️ and 🍸 by Ryan Osmaston**
