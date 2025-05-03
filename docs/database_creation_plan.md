# Database Creation Plan

## Database Credentials

```
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=guidia-web-db
PORT=3001
```

## SQL Commands

Here are the SQL commands to create the tables:

```sql
CREATE TABLE events (
  eventID INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  eventDate DATETIME NOT NULL,
  imageURL VARCHAR(255) NOT NULL,
  imagePath VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE news (
  newsID INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  newsDate DATE NOT NULL,
  imageURLs TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  imagePath VARCHAR(255)
);

CREATE TABLE otp_verifications (
  otpID INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(191) UNIQUE NOT NULL,
  otp VARCHAR(6),
  registrationData VARCHAR(50),
  otpSentCount INT DEFAULT 0,
  otpVerifyAttempts INT DEFAULT 0,
  lastAttemptTime DATETIME,
  expiresAt DATETIME,
  verified TINYINT(1) DEFAULT 0,
  completed TINYINT(1) DEFAULT 0
);

CREATE TABLE pending_registrations (
  penRegID INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(191) UNIQUE NOT NULL,
  userData JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reason TEXT
);

CREATE TABLE roles (
  roleID INT PRIMARY KEY AUTO_INCREMENT,
  roleName VARCHAR(50)
);

CREATE TABLE users (
  userID INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(191) UNIQUE,
  username VARCHAR(255),
  password VARCHAR(255),
  roleID INT,
  status VARCHAR(20) DEFAULT 'active'
);