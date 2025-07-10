# Support Bot System

A comprehensive support ticket management system that allows customers to report issues without login requirements and provides internal staff with powerful tools to manage, track, and export support tickets.

## Features

### Customer Portal
- **No Login Required**: Customers can submit issues without creating accounts
- **Multiple Issue Types**: Bug reports, feature requests, and general support
- **Priority Levels**: Critical, High, Medium, and Low priority classification
- **Real-time Validation**: Form validation with helpful error messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

### Admin Dashboard
- **Issue Management**: View, update, and track all support tickets
- **Advanced Filtering**: Filter by status, type, and priority
- **Real-time Statistics**: Live dashboard with key metrics
- **Excel Export**: Export all issues to Excel format
- **Pagination**: Efficiently browse through large numbers of tickets
- **Detailed Issue View**: Comprehensive modal with all issue information
- **Assignment Management**: Assign tickets to staff members
- **Internal Notes**: Add private notes for internal communication

### Technical Features
- **REST API**: Complete API for all operations
- **SQLite Database**: Lightweight database for easy deployment
- **Excel Integration**: Professional Excel export with styling
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Auto-refresh functionality
- **Error Handling**: Comprehensive error handling and user feedback

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd support-bot
   
   # Or extract the downloaded files to a directory
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the application**
   - Customer Portal: http://localhost:5000
   - Admin Dashboard: http://localhost:5000/admin

The database will be automatically created on first run.

## Usage

### Customer Portal

#### Submitting an Issue
1. Navigate to http://localhost:5000
2. Fill out the issue form:
   - **Type of Request**: Choose between Bug Report, Feature Request, or General Support
   - **Issue Title**: Brief description of the problem
   - **Detailed Description**: Comprehensive explanation with steps to reproduce, expected behavior, etc.
   - **Contact Information**: Name and email (required), phone (optional)
   - **Priority Level**: Self-assessment of issue severity
3. Click "Submit Issue"
4. Receive confirmation with unique issue ID

#### Response Times
- **Critical**: Within 2 hours
- **High**: Within 4 hours  
- **Medium**: Within 1 business day
- **Low**: Within 3 business days

### Admin Dashboard

#### Accessing the Dashboard
1. Navigate to http://localhost:5000/admin
2. The dashboard automatically loads recent issues and statistics

#### Viewing Issues
- Issues are displayed in a table with key information
- Click on any row to view detailed issue information
- Use pagination controls to browse through issues

#### Filtering Issues
1. Use the filter section at the top of the dashboard
2. Available filters:
   - **Status**: Open, In Progress, Resolved, Closed
   - **Type**: Bug Report, Feature Request, General Support
   - **Priority**: Critical, High, Medium, Low
3. Click "Apply Filters" to filter the view
4. Click "Clear" to reset all filters

#### Managing Issues
1. Click on an issue to open the detail modal
2. In the modal, you can:
   - View complete issue information
   - Update status and priority
   - Assign to staff members
   - Add internal notes
3. Click "Update Issue" to save changes

#### Exporting Data
1. Click the "Export to Excel" button in the header
2. All issues will be exported to an Excel file
3. The file includes all issue data with professional formatting
4. File is automatically downloaded with timestamp

## API Documentation

### Base URL
All API endpoints are prefixed with `/api`

### Endpoints

#### Create Issue
```
POST /api/issues
Content-Type: application/json

{
    "title": "Issue title",
    "description": "Detailed description",
    "customer_name": "Customer name",
    "customer_email": "customer@example.com",
    "customer_phone": "+1234567890",
    "issue_type": "bug|feature_request|support",
    "priority": "low|medium|high|critical"
}
```

#### Get Issues (Paginated)
```
GET /api/issues?page=1&per_page=10&status=open&issue_type=bug&priority=high
```

#### Get Single Issue
```
GET /api/issues/{issue_id}
```

#### Update Issue
```
PUT /api/issues/{issue_id}
Content-Type: application/json

{
    "status": "open|in_progress|resolved|closed",
    "priority": "low|medium|high|critical",
    "assigned_to": "Staff member name",
    "internal_notes": "Internal notes"
}
```

#### Export Issues
```
GET /api/issues/export
```

#### Get Statistics
```
GET /api/stats
```

## Database Schema

### Issue Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| title | String(200) | Issue title |
| description | Text | Detailed description |
| customer_name | String(100) | Customer name |
| customer_email | String(120) | Customer email |
| customer_phone | String(20) | Customer phone (optional) |
| issue_type | String(50) | Type: bug, feature_request, support |
| priority | String(20) | Priority: low, medium, high, critical |
| status | String(20) | Status: open, in_progress, resolved, closed |
| assigned_to | String(100) | Assigned staff member (optional) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |
| resolved_at | DateTime | Resolution timestamp (optional) |
| internal_notes | Text | Internal notes (optional) |

## Configuration

### Environment Variables
You can configure the application using environment variables:

```bash
# Database URL (default: sqlite:///support_bot.db)
DATABASE_URL=sqlite:///support_bot.db

# Secret key for sessions (change in production)
SECRET_KEY=your-secret-key-here

# Debug mode (default: True)
DEBUG=True

# Host and port
HOST=0.0.0.0
PORT=5000
```

### Production Deployment

#### Security Considerations
1. **Change the secret key** in production
2. **Use HTTPS** for encrypted communication
3. **Implement authentication** for admin access
4. **Use a production database** (PostgreSQL recommended)
5. **Set up proper logging**
6. **Configure CORS** appropriately

#### Database Migration
To use PostgreSQL in production:
1. Install psycopg2: `pip install psycopg2-binary`
2. Update DATABASE_URL: `postgresql://user:password@localhost/support_bot`
3. Run the application to create tables

## File Structure

```
support-bot/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This documentation
├── templates/            # HTML templates
│   ├── index.html        # Customer portal
│   └── admin.html        # Admin dashboard
├── static/              # Static assets
│   ├── css/
│   │   ├── style.css     # Customer portal styles
│   │   └── admin.css     # Admin dashboard styles
│   └── js/
│       ├── app.js        # Customer portal JavaScript
│       └── admin.js      # Admin dashboard JavaScript
└── support_bot.db       # SQLite database (created automatically)
```

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Responsive**: Optimized for tablets and mobile devices

## Features in Detail

### Real-time Validation
- Email format validation
- Phone number validation
- Required field checking
- Character count limits
- Visual feedback for form fields

### Excel Export Features
- Professional formatting with headers
- Color-coded priority and status columns
- Automatic column width adjustment
- Timestamp in filename
- Complete data export including internal notes

### Admin Dashboard Features
- **Live Statistics**: Auto-updating counters
- **Advanced Search**: Multiple filter combinations
- **Bulk Operations**: Export filtered results
- **Responsive Tables**: Mobile-optimized tables
- **Modal Interactions**: Detailed issue management

### Security Features
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Built-in Flask protection
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Data Validation**: Server-side validation

## Troubleshooting

### Common Issues

#### Database Connection Error
```
# Solution: Ensure SQLite permissions
chmod 664 support_bot.db
```

#### Port Already in Use
```
# Solution: Use different port
python app.py --port 5001
```

#### Missing Dependencies
```
# Solution: Reinstall requirements
pip install --upgrade -r requirements.txt
```

### Performance Optimization

#### For High Volume
1. **Use PostgreSQL** instead of SQLite
2. **Implement caching** with Redis
3. **Add database indexing** on frequently queried fields
4. **Use a reverse proxy** like Nginx
5. **Implement rate limiting**

## Future Enhancements

### Planned Features
- **Email Notifications**: Automatic updates to customers
- **File Attachments**: Support for screenshots and documents
- **Advanced Analytics**: Reporting and metrics
- **API Authentication**: Secure API access
- **Multi-language Support**: Internationalization
- **Custom Fields**: Configurable form fields
- **Workflow Automation**: Automated status updates
- **Integration APIs**: Connect with external tools

### Customization
The system is designed to be easily customizable:
- **Themes**: Modify CSS files for different branding
- **Fields**: Add custom fields to the database model
- **Workflows**: Implement custom business logic
- **Integrations**: Add external service connections

## Support

For technical support or questions about this system:

1. **Check the logs** in the console for error messages
2. **Verify database connectivity** and permissions
3. **Ensure all dependencies** are installed correctly
4. **Check browser console** for JavaScript errors

## License

This project is provided as-is for educational and business use. Feel free to modify and adapt it to your specific needs.

---

**Last Updated**: 2024  
**Version**: 1.0.0