DROP DATABASE IF EXISTS Healthcare_app;
CREATE DATABASE Healthcare_app;
USE Healthcare_app;

CREATE TABLE Login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    type ENUM ('doctor', 'patient') NOT NULL,
    multifa_secret TEXT NOT NULL
);

CREATE TABLE DoctorInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_address TEXT,
    doctor_id INT,
    name TEXT
);

CREATE TABLE PatientInfo (
    user_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    cpr TEXT,
    date_of_birth DATE,
    address TEXT,
    gender TEXT,
    blood_type TEXT,
    name TEXT,
    doctor_id INT
);

CREATE TABLE Journal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    journal_input TEXT,
    date DATE,
    author TEXT
);

CREATE TABLE TestInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    test_result TEXT,
    date DATE,
    test_type TEXT,
    author TEXT
);
