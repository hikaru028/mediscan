from celery import Celery
from celery.schedules import crontab
from utils.reminder import send_reminder_email_task  # Import the task to register it

celery = Celery(
    'tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
)

celery.conf.update(
    timezone='UTC',
    enable_utc=True,
)

# Schedule the task to run every minute (for testing)
celery.conf.beat_schedule = {
    'send_reminder_emails_daily': {
        'task': 'utils.reminder.send_reminder_email_task',
        # 'schedule': crontab(hour=0, minute=0),  # Runs daily at midnight
        'schedule': crontab(minute='*'),  # Runs every minute

    },
}

celery.autodiscover_tasks(['utils.reminder'])
