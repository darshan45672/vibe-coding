import { create } from 'zustand'

export interface Treatment {
    id: string
    doctorId: string
    doctorName: string
    patientId: string
    patientName: string
    diagnosis: string
    treatmentDetails?: string
    cost: number
    date: string
    status: 'pending' | 'submitted'
}

export interface Appointment {
    id: string
    patientId: string
    patientName: string
    doctorId: string
    doctorName: string
    date: string
    time: string
    reason: string
    status: 'scheduled' | 'completed' | 'cancelled'
    bookedDate: string
}

export interface Claim {
    id: string
    patientId: string
    patientName: string
    doctorId: string
    doctorName: string
    treatmentId: string
    diagnosis: string
    cost: number
    documents: string[]
    status: 'pending' | 'approved' | 'rejected'
    submittedDate: string
    reviewedDate?: string
    insuranceNotes?: string
}

export interface Payment {
    id: string
    claimId: string
    amount: number
    status: 'pending' | 'initiated' | 'completed' | 'rejected'
    initiatedDate: string
    completedDate?: string
    bankNotes?: string
}

export interface User {
    id: string
    name: string
    role: 'doctor' | 'patient' | 'insurance' | 'bank'
    email: string
}

interface AppState {
    currentUser: User | null
    currentRole: 'doctor' | 'patient' | 'insurance' | 'bank'
    users: User[]
    treatments: Treatment[]
    appointments: Appointment[]
    claims: Claim[]
    payments: Payment[]

    // Actions
    setCurrentRole: (role: 'doctor' | 'patient' | 'insurance' | 'bank') => void
    setCurrentUser: (user: User) => void
    addTreatment: (treatment: Omit<Treatment, 'id' | 'status'>) => void
    updateTreatment: (treatmentId: string, updates: Partial<Treatment>) => void
    submitTreatment: (treatmentId: string) => void
    addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'bookedDate'>) => void
    updateAppointment: (appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'bookedDate'>>) => void
    deleteAppointment: (appointmentId: string) => void
    updateAppointmentStatus: (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') => void
    addClaim: (claim: Omit<Claim, 'id' | 'status' | 'submittedDate'>) => void
    updateClaim: (claimId: string, updates: Partial<Omit<Claim, 'id' | 'submittedDate'>>) => void
    deleteClaim: (claimId: string) => void
    reviewClaim: (claimId: string, status: 'approved' | 'rejected', notes?: string) => void
    addPayment: (payment: Omit<Payment, 'id' | 'status' | 'initiatedDate'>) => void
    completePayment: (paymentId: string, notes?: string) => void
    rejectPayment: (paymentId: string, notes?: string) => void
}

// Dummy data
const dummyUsers: User[] = [
    { id: '1', name: 'Dr. Sarah Johnson', role: 'doctor', email: 'sarah.johnson@hospital.com' },
    { id: '2', name: 'Dr. Michael Chen', role: 'doctor', email: 'michael.chen@hospital.com' },
    { id: '3', name: 'John Smith', role: 'patient', email: 'john.smith@email.com' },
    { id: '4', name: 'Emma Wilson', role: 'patient', email: 'emma.wilson@email.com' },
    { id: '5', name: 'Robert Davis', role: 'patient', email: 'robert.davis@email.com' },
    { id: '6', name: 'Insurance Reviewer', role: 'insurance', email: 'reviewer@insurance.com' },
    { id: '7', name: 'Bank Officer', role: 'bank', email: 'officer@bank.com' },
]

const dummyTreatments: Treatment[] = [
    {
        id: '1',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        patientId: '3',
        patientName: 'John Smith',
        diagnosis: 'Annual Physical Examination',
        treatmentDetails: 'Comprehensive health check-up including blood work, vital signs monitoring, and general physical assessment.',
        cost: 250,
        costBreakdown: {
            consultation: 100,
            procedures: 80,
            medication: 20,
            equipment: 30,
            other: 20
        },
        date: '2025-07-25',
        status: 'submitted',
        medicalReports: ['blood_test_results.pdf', 'physical_exam_report.pdf'],
        validatedForClaim: true,
        validationNotes: 'All procedures completed successfully and documented properly.'
    },
    {
        id: '2',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        patientId: '4',
        patientName: 'Emma Wilson',
        diagnosis: 'Sprained Ankle Treatment',
        treatmentDetails: 'X-ray examination, pain management, and physical therapy consultation for grade 2 ankle sprain.',
        cost: 450,
        costBreakdown: {
            consultation: 150,
            procedures: 200,
            medication: 50,
            equipment: 30,
            other: 20
        },
        date: '2025-07-28',
        status: 'submitted'
    },
    {
        id: '3',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        patientId: '4',
        patientName: 'Emma Wilson',
        diagnosis: 'Blood Pressure Check',
        cost: 150,
        date: '2025-07-20',
        status: 'submitted'
    },
    {
        id: '4',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        patientId: '5',
        patientName: 'Robert Davis',
        diagnosis: 'Flu Treatment',
        cost: 200,
        date: '2025-07-22',
        status: 'submitted'
    },
    {
        id: '5',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        patientId: '5',
        patientName: 'Robert Davis',
        diagnosis: 'Diabetes Consultation',
        cost: 300,
        date: '2025-07-24',
        status: 'pending'
    },
    {
        id: '6',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        patientId: '3',
        patientName: 'John Smith',
        diagnosis: 'Dental Checkup',
        cost: 180,
        date: '2025-07-29',
        status: 'submitted'
    }
]

const dummyClaims: Claim[] = [
    {
        id: '1',
        patientId: '3',
        patientName: 'John Smith',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        treatmentId: '1',
        diagnosis: 'Annual Physical Examination',
        cost: 250,
        documents: ['medical_report.pdf', 'lab_results.pdf'],
        status: 'approved',
        submittedDate: '2025-07-26',
        reviewedDate: '2025-07-27',
        insuranceNotes: 'Claim approved - routine checkup covered under policy'
    },
    {
        id: '5',
        patientId: '3',
        patientName: 'John Smith',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        treatmentId: '6',
        diagnosis: 'Dental Checkup',
        cost: 180,
        documents: ['dental_report.pdf'],
        status: 'pending',
        submittedDate: '2025-07-30'
    },
    {
        id: '2',
        patientId: '4',
        patientName: 'Emma Wilson',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        treatmentId: '2',
        diagnosis: 'Sprained Ankle Treatment',
        cost: 450,
        documents: ['x_ray.pdf', 'treatment_plan.pdf'],
        status: 'pending',
        submittedDate: '2025-07-29'
    },
    {
        id: '3',
        patientId: '4',
        patientName: 'Emma Wilson',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        treatmentId: '3',
        diagnosis: 'Blood Pressure Check',
        cost: 150,
        documents: ['bp_report.pdf'],
        status: 'approved',
        submittedDate: '2025-07-21',
        reviewedDate: '2025-07-22',
        insuranceNotes: 'Approved - preventive care covered'
    },
    {
        id: '4',
        patientId: '5',
        patientName: 'Robert Davis',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        treatmentId: '4',
        diagnosis: 'Flu Treatment',
        cost: 200,
        documents: ['prescription.pdf', 'visit_notes.pdf'],
        status: 'rejected',
        submittedDate: '2025-07-23',
        reviewedDate: '2025-07-24',
        insuranceNotes: 'Rejected - insufficient documentation'
    }
]

const dummyAppointments: Appointment[] = [
    {
        id: '1',
        patientId: '3',
        patientName: 'John Smith',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        date: '2025-08-05',
        time: '09:00',
        reason: 'Regular checkup and blood pressure monitoring',
        status: 'scheduled',
        bookedDate: '2025-07-30'
    },
    {
        id: '2',
        patientId: '3',
        patientName: 'John Smith',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        date: '2025-08-10',
        time: '14:00',
        reason: 'Follow-up consultation for dental care',
        status: 'scheduled',
        bookedDate: '2025-07-29'
    },
    {
        id: '3',
        patientId: '4',
        patientName: 'Emma Wilson',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        date: '2025-08-01',
        time: '11:00',
        reason: 'Ankle injury follow-up examination',
        status: 'completed',
        bookedDate: '2025-07-25'
    }
]

const dummyPayments: Payment[] = [
    {
        id: '1',
        claimId: '1',
        amount: 200, // 80% coverage
        status: 'completed',
        initiatedDate: '2025-07-27',
        completedDate: '2025-07-28',
        bankNotes: 'Payment processed successfully to patient account'
    },
    {
        id: '2',
        claimId: '1',
        amount: 360, // 80% coverage for a $450 claim
        status: 'pending',
        initiatedDate: '2025-07-30'
    }
]

export const useAppStore = create<AppState>((set, get) => ({
    currentUser: dummyUsers[0],
    currentRole: 'doctor',
    users: dummyUsers,
    treatments: dummyTreatments,
    appointments: dummyAppointments,
    claims: dummyClaims,
    payments: dummyPayments,

    setCurrentRole: (role) => {
        const user = get().users.find(u => u.role === role)
        set({ currentRole: role, currentUser: user || null })
    },

    setCurrentUser: (user) => set({ currentUser: user }),

    addTreatment: (treatment) => {
        const newTreatment: Treatment = {
            ...treatment,
            id: Date.now().toString(),
            status: 'pending'
        }
        set(state => ({ treatments: [...state.treatments, newTreatment] }))
    },

    submitTreatment: (treatmentId) => {
        set(state => ({
            treatments: state.treatments.map(t =>
                t.id === treatmentId ? { ...t, status: 'submitted' } : t
            )
        }))
    },

    addAppointment: (appointment) => {
        const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString(),
            status: 'scheduled',
            bookedDate: new Date().toISOString().split('T')[0]
        }
        set(state => ({ appointments: [...state.appointments, newAppointment] }))
    },

    updateAppointment: (appointmentId, updates) => {
        set(state => ({
            appointments: state.appointments.map(a =>
                a.id === appointmentId ? { ...a, ...updates } : a
            )
        }))
    },

    deleteAppointment: (appointmentId) => {
        set(state => ({
            appointments: state.appointments.filter(a => a.id !== appointmentId)
        }))
    },

    updateAppointmentStatus: (appointmentId, status) => {
        set(state => ({
            appointments: state.appointments.map(a =>
                a.id === appointmentId ? { ...a, status } : a
            )
        }))
    },

    addClaim: (claim) => {
        const newClaim: Claim = {
            ...claim,
            id: Date.now().toString(),
            status: 'pending',
            submittedDate: new Date().toISOString().split('T')[0]
        }
        set(state => ({ claims: [...state.claims, newClaim] }))
    },

    updateClaim: (claimId, updates) => {
        set(state => ({
            claims: state.claims.map(c =>
                c.id === claimId ? { ...c, ...updates } : c
            )
        }))
    },

    deleteClaim: (claimId) => {
        set(state => ({
            claims: state.claims.filter(c => c.id !== claimId)
        }))

        // Also remove associated payment if it exists
        set(state => ({
            payments: state.payments.filter(p => p.claimId !== claimId)
        }))
    },

    reviewClaim: (claimId, status, notes) => {
        set(state => ({
            claims: state.claims.map(c =>
                c.id === claimId
                    ? {
                        ...c,
                        status,
                        reviewedDate: new Date().toISOString().split('T')[0],
                        insuranceNotes: notes
                    }
                    : c
            )
        }))

        // Auto-create payment for approved claims
        if (status === 'approved') {
            const claim = get().claims.find(c => c.id === claimId)
            if (claim) {
                const payment: Payment = {
                    id: Date.now().toString(),
                    claimId,
                    amount: Math.floor(claim.cost * 0.8), // 80% coverage
                    status: 'pending',
                    initiatedDate: new Date().toISOString().split('T')[0]
                }
                set(state => ({ payments: [...state.payments, payment] }))
            }
        }
    },

    addPayment: (payment) => {
        const newPayment: Payment = {
            ...payment,
            id: Date.now().toString(),
            status: 'pending',
            initiatedDate: new Date().toISOString().split('T')[0]
        }
        set(state => ({ payments: [...state.payments, newPayment] }))
    },

    completePayment: (paymentId, notes) => {
        set(state => ({
            payments: state.payments.map(p =>
                p.id === paymentId
                    ? {
                        ...p,
                        status: 'completed',
                        completedDate: new Date().toISOString().split('T')[0],
                        bankNotes: notes
                    }
                    : p
            )
        }))
    },

    rejectPayment: (paymentId, notes) => {
        set(state => ({
            payments: state.payments.map(p =>
                p.id === paymentId
                    ? {
                        ...p,
                        status: 'rejected',
                        completedDate: new Date().toISOString().split('T')[0],
                        bankNotes: notes
                    }
                    : p
            )
        }))
    }
}))
