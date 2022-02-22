import Database from "better-sqlite3";
import { interviewers, applicants, interviews } from './helperFiles/data'

const db = new Database('./data.db', {
    verbose: console.log
})

db.exec(`
DROP TABLE IF EXISTS interviewers;
DROP TABLE IF EXISTS applicants;
DROP TABLE IF EXISTS interviews;

CREATE TABLE IF NOT EXISTS interviewers (
    id INTEGER,
    name TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER,
    name TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER,
    interviewerId INTEGER,
    applicantId INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (applicantId) REFERENCES applicants(id)
    FOREIGN KEY (interviewerId) REFERENCES interviewers(id)
);
`)

const createInterviewer = db.prepare(`
INSERT INTO interviewers (name) VALUES (?)`)

const createApplicant = db.prepare(`
INSERT INTO applicants (name) VALUES (?)`)

const createInterview = db.prepare(`
INSERT INTO interviews (interviewerId, applicantId) VALUES (?, ?)`)

for(const interviewer of interviewers) {
    createInterviewer.run(interviewer.name)
}

for(const applicant of applicants) {
    createApplicant.run(applicant.name)
}

for(const interview of interviews) {
    const { interviewerId, applicantId } = interview
    createInterview.run(interviewerId, applicantId)
}