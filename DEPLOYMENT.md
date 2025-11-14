# Dota 2 Battle Management System - Docker Deployment Guide

This guide will help you deploy the Dota 2 Battle Management System to your cloud server using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Linux server (Ubuntu 20.04+, CentOS 8+, or similar)
- At least 2GB RAM, 2 CPU cores
- 20GB+ available disk space

## Quick Start (Development/Simple Deployment)

### 1. Upload project files to your server

```bash
# Using SCP
scp -r ./dota2-system user@your-server:/opt/

# Or using Git
git clone https://github.com/your-repo/dota2-system.git /opt/dota2-system
```

### 2. Configure environment variables

```bash
cd /opt/dota2-system
cp .env.example .env
nano .env
```

Edit `.env` and set your secure passwords and secrets:

```env
# Change these to strong, random values
MYSQL_ROOT_PASSWORD=your_very_secure_root_password
MYSQL_PASSWORD=your_very_secure_database_password
JWT_SECRET=$(openssl rand -base64 32)
```

### 3. Build and start services

```bash
# Build the application
docker compose build

# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### 4. Run database migrations

```bash
# Execute migrations
docker compose exec app node -e "
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    console.log('Database connection successful. Run migrations manually.');
    await connection.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
"
```

Alternative: Use the `db:push` command if you have the Drizzle CLI available.

### 5. Access the application

- **Web Interface**: http://your-server-ip:3000
- **Database**: localhost:23330 (MySQL)

## Production Deployment (Recommended)

For production environments with better security, performance, and resource management:

### 1. Prepare the server

```bash
# Create application directory
sudo mkdir -p /opt/dota2
sudo chown $USER:$USER /opt/dota2

# Create data directory for MySQL persistence
sudo mkdir -p /opt/dota2/mysql
sudo chown 999:999 /opt/dota2/mysql  # MySQL user in container

# Upload project files
cd /opt/dota2
git clone <your-repo> .
# or upload and extract your project files here
```

### 2. Create environment file

```bash
cp .env.example .env
nano .env
```

Set production values:

```env
NODE_ENV=production
APP_PORT=3000

DATABASE_URL=mysql://dota2user:YOUR_SECURE_PASSWORD@db:3306/dota2

MYSQL_ROOT_PASSWORD=YOUR_VERY_SECURE_ROOT_PASSWORD
MYSQL_DATABASE=dota2
MYSQL_USER=dota2user
MYSQL_PASSWORD=YOUR_VERY_SECURE_PASSWORD
MYSQL_PORT=23330

JWT_SECRET=$(openssl rand -base64 32)
VITE_APP_ID=dota2-battle-system
```

### 3. Deploy with production configuration

```bash
# Use production compose file
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Monitor resource usage
docker stats
```

## Management Commands

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 -f
```

### Restart services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
docker compose restart db
```

### Update application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Prune old images
docker image prune -a
```

### Backup database

```bash
# Create backup
docker compose exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} dota2 > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose exec -i db mysql -u root -p${MYSQL_ROOT_PASSWORD} dota2 < backup_file.sql
```

### Scale services (if needed)

```bash
# Scale app instances (note: database can't be scaled)
docker compose up -d --scale app=2
```

## Nginx Reverse Proxy (Optional, for Production)

For production, consider using Nginx as a reverse proxy with SSL:

### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/dota2`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/dota2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Check service health

```bash
# View service status
docker compose ps

# Check logs for errors
docker compose logs app
docker compose logs db

# Test database connection
docker compose exec app npm run check
```

### Common issues

**Port already in use:**
```bash
# Find process using port
sudo netstat -tulpn | grep :3000
# Kill process
sudo kill -9 <PID>
```

**Database connection error:**
```bash
# Check MySQL is ready
docker compose exec db mysqladmin ping -h localhost
# View MySQL logs
docker compose logs db
```

**Migration issues:**
```bash
# Drop and recreate database (⚠️ WARNING: This deletes all data)
docker compose down -v
docker compose up -d db
# Wait for MySQL to be ready, then run migrations
```

**Permission issues:**
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/dota2
sudo chmod -R 755 /opt/dota2
```

### Performance tuning

**MySQL optimization:**
Edit `docker-compose.prod.yml` and add MySQL config:

```yaml
db:
  # ... existing config
  command: --default-authentication-plugin=mysql_native_password
           --innodb-buffer-pool-size=256M
           --max-connections=200
           --innodb-log-file-size=64M
```

**App optimization:**
Increase resources in `deploy.resources.limits`:

```yaml
app:
  deploy:
    resources:
      limits:
        memory: 2G  # Increase if needed
        cpus: '2.0'
```

## Security Considerations

1. **Change default passwords**: Always change default passwords in `.env`
2. **Use strong JWT secret**: Generate with `openssl rand -base64 32`
3. **Enable firewall**: Only allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
4. **Regular updates**: Keep Docker and system packages updated
5. **SSL certificate**: Use HTTPS in production
6. **Database security**: Restrict MySQL access to localhost only
7. **Backup strategy**: Implement automated daily backups

## Monitoring

### Set up monitoring

```bash
# Install cAdvisor for container monitoring
docker run -d --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  google/cadvisor

# Access at http://your-server:8080
```

### Log rotation

Logs are automatically rotated by Docker, but you can configure external rotation:

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/docker-containers

# Add:
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size 1M
    missingok
    delaycompress
    copytruncate
}
```

## Support

For issues and questions:
- Check logs: `docker compose logs`
- Review this documentation
- Open an issue on GitHub
