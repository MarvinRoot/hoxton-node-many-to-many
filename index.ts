import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const app = express()
app.use(cors())
app.use(express.json())

const db = new Database('./data.db', {
    verbose: console.log
})

const getAllInterviewers = db.prepare(`
SELECT * FROM interviewers;`)

const getAllApplicants = db.prepare(`
SELECT * FROM applicants;`)

const getAllInterviews = db.prepare(`
SELECT * FROM interviews;`)

const getInterviewerById = db.prepare(`
SELECT * FROM interviewers WHERE id=?`)

const getApplicantById = db.prepare(`
SELECT * FROM applicants WHERE id=?`)

const getInterviewById = db.prepare(`
SELECT * FROM interviews WHERE id=?`)

const getApplicantsForInterviewerById = db.prepare(`
SELECT DISTINCT applicants.* FROM applicants
JOIN interviews ON applicants.id = interviews.applicantId
WHERE interviews.interviewerId = ?;
`)

const getInterviewersForApplicantById = db.prepare(`
SELECT Distinct interviewers.* FROM interviewers
JOIN interviews ON interviewers.id = interviews.interviewerId
WHERE interviews.applicantId = ?;
`)

const createInterviewer = db.prepare(`
INSERT INTO interviewers (name) VALUES (?)`)

const createApplicant = db.prepare(`
INSERT INTO applicants (name) VALUES (?)`)

const createInterview = db.prepare(`
INSERT INTO interviews (interviewerId, applicantId) VALUES (?, ?)`)

app.get('/interviewers', (req, res) => {
    const interviewers = getAllInterviewers.all()

    for (const interviewer of interviewers) {
        const applicants = getApplicantsForInterviewerById.all(interviewer.id)
        interviewer.applicants = applicants
    }
    res.send(interviewers)
})

app.get('/applicants', (req, res) => {
    const applicants = getAllApplicants.all()
    for (const applicant of applicants) {
        const interviewers = getInterviewersForApplicantById.all(applicant.id)
        applicant.interviewers = interviewers
    }
    res.send(applicants)
})

app.get('/interviews', (req, res) => {
    const interviews = getAllInterviews.all()
    res.send(interviews)
})

app.post('/interviewers', (req, res) => {
    const name = req.body.name
    const errors = []
    if (typeof name !== 'string') errors.push('Name is missing or not a string ')

    if (errors.length === 0) {
        const result = createInterviewer.run(name)
        const newInterviewer = getInterviewerById.get(result.lastInsertRowid)
        res.send(newInterviewer)
    } else res.status(400).send({ error: 'Interviewer not found.' })
})

app.post('/applicants', (req, res) => {
    const name = req.body.name
    const errors = []
    if (typeof name !== 'string') errors.push('Name is missing or not a string ')

    if (errors.length === 0) {
        const result = createApplicant.run(name)
        const newApplicant = getApplicantById.get(result.lastInsertRowid)
        res.send(newApplicant)
    } else res.status(400).send({ error: 'Applicant not found.' })
})

app.post('/interviews', (req, res) => {
    const { interviewerId, applicantId } = req.body
    const errors = []
    if (typeof interviewerId !== 'number') errors.push('interviewerId is missing or not a string ')
    if (typeof applicantId !== 'number') errors.push('applicantId is missing or not a string ')

    if (errors.length === 0) {
        const interviewer = getInterviewerById.get(interviewerId)
        const applicant = getApplicantById.get(applicantId)

        if (interviewer && applicant) {
            const result = createInterview.run(interviewerId, applicantId)
            const newInterview = getInterviewById.get(result.lastInsertRowid)
            res.send(newInterview)
        }


    } else res.status(400).send({ error: 'Interview not found.' })
})

app.listen(4000, () => {
    console.log(`Server up: http://localhost:4000`)
})