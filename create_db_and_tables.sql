DROP DATABASE IF EXISTS Healthcare_app;
CREATE DATABASE Healthcare_app;
USE Healthcare_app;

CREATE TABLE Login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(100),
    password VARCHAR(255),
    type VARCHAR(10)
);

CREATE TABLE DoctorInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_address VARCHAR(255),
    doctor_id INT,
    name VARCHAR(100)
);

CREATE TABLE PatientInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    cpr VARCHAR(10),
    date_of_birth DATE,
    address VARCHAR(255),
    gender VARCHAR(20),
    blood_type VARCHAR(5),
    name VARCHAR(100),
    doctor_id INT
);

CREATE TABLE Journal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    journal_input TEXT,
    date DATE,
    author VARCHAR(100)
);

CREATE TABLE TestInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    test_result TEXT,
    date DATE,
    test_type VARCHAR(100),
    author VARCHAR(100)
);