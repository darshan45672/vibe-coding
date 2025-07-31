import { create } from 'zustand'

export interface MedicalReport {
    id: string
    fileName: string
    uploadDate: string
    status: 'uploaded' | 'pending' | 'processing' | 'verified'
    type: 'lab_result' | 'xray' | 'prescription' | 'scan' | 'document' | 'other'
    notes?: string
    ocrData?: {
        extractedText: string
        confidence: number
        extractedFields: {
            patientName?: string
            doctorName?: string
            date?: string
            diagnosis?: string
            medications?: string[]
            amount?: number
            hospitalName?: string
        }
    }
    fraudScore?: number
}

export interface ProviderNetwork {
    id: string
    name: string
    type: 'hospital' | 'clinic' | 'diagnostic_center' | 'pharmacy'
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    email: string
    specialties: string[]
    rating: number
    isApproved: boolean
    networkTier: 'tier1' | 'tier2' | 'tier3'
    cashlessLimit: number
    empanelmentDate: string
}

export interface FraudAlert {
    id: string
    claimId: string
    type: 'duplicate_claim' | 'excessive_billing' | 'fake_provider' | 'suspicious_pattern' | 'document_forgery'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    confidence: number
    detectedDate: string
    status: 'active' | 'resolved' | 'false_positive'
    investigatorNotes?: string
}

export interface EligibilityCheck {
    id: string
    patientId: string
    policyNumber: string
    coverageType: string
    status: 'active' | 'expired' | 'suspended'
    eligibleAmount: number
    usedAmount: number
    remainingAmount: number
    validUntil: string
    preAuthRequired: boolean
    networkRestrictions: string[]
}

export interface ClaimSLA {
    id: string
    claimId: string
    stage: 'submitted' | 'under_review' | 'additional_docs_required' | 'approved' | 'rejected'
    expectedCompletionDate: string
    actualCompletionDate?: string
    isEscalated: boolean
    escalationLevel: number
    escalationDate?: string
    remindersSent: number
    assignedTo: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface AadhaarValidation {
    id: string
    userId: string
    aadhaarNumber: string
    name: string
    dateOfBirth: string
    gender: 'M' | 'F' | 'O'
    address: string
    validationStatus: 'pending' | 'verified' | 'failed'
    validationDate?: string
    otp?: string
    biometricData?: string
}

export interface Treatment {
    id: string
    doctorId: string
    doctorName: string
    patientId: string
    patientName: string
    diagnosis: string
    treatmentDetails?: string
    cost: number
    costBreakdown?: {
        consultation: number
        procedures: number
        medication: number
        equipment: number
        other: number
    }
    date: string
    status: 'pending' | 'submitted'
    medicalReports?: MedicalReport[]
    dischargeSummary?: string
    validatedForClaim?: boolean
    validationNotes?: string
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
    currentRole: 'doctor' | 'patient' | 'insurance' | 'bank' | 'advanced'
    users: User[]
    treatments: Treatment[]
    appointments: Appointment[]
    claims: Claim[]
    payments: Payment[]
    
    // Advanced Features State
    providerNetwork: ProviderNetwork[]
    fraudAlerts: FraudAlert[]
    eligibilityChecks: EligibilityCheck[]
    claimSLAs: ClaimSLA[]
    aadhaarValidations: AadhaarValidation[]

    // Actions
    setCurrentRole: (role: 'doctor' | 'patient' | 'insurance' | 'bank' | 'advanced') => void
    setCurrentUser: (user: User) => void
    addTreatment: (treatment: Omit<Treatment, 'id' | 'status'>) => void
    updateTreatment: (treatmentId: string, updates: Partial<Treatment>) => void
    deleteTreatment: (treatmentId: string) => void
    submitTreatment: (treatmentId: string) => void
    addDischargeSummary: (treatmentId: string, summary: string) => void
    validateTreatmentForClaim: (treatmentId: string, isValid: boolean, notes?: string) => void
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
    
    // Advanced Features Actions
    processOCR: (file: File, reportId: string) => Promise<void>
    detectFraud: (claimId: string) => Promise<FraudAlert[]>
    checkEligibility: (patientId: string, policyNumber: string) => Promise<EligibilityCheck>
    validateAadhaar: (aadhaarNumber: string, otp?: string) => Promise<AadhaarValidation>
    searchProviders: (filters: { city?: string, specialty?: string, type?: string }) => ProviderNetwork[]
    updateClaimSLA: (claimId: string, stage: ClaimSLA['stage']) => void
    escalateClaim: (claimId: string) => void
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
        medicalReports: [
            {
                id: '1',
                fileName: 'blood_test_results.pdf',
                uploadDate: '2025-07-25',
                status: 'verified',
                type: 'lab_result',
                notes: 'Complete blood panel - all values within normal range'
            },
            {
                id: '2',
                fileName: 'physical_exam_report.pdf',
                uploadDate: '2025-07-25',
                status: 'uploaded',
                type: 'document',
                notes: 'Physical examination findings documented'
            }
        ],
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

// Advanced Features Dummy Data
const dummyProviderNetwork: ProviderNetwork[] = [
    {
        id: '1',
        name: 'Apollo Hospital',
        type: 'hospital',
        address: 'Greams Lane, Thousand Lights',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600006',
        phone: '+91-44-2829-3333',
        email: 'info@apollohospitals.com',
        specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
        rating: 4.8,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 500000,
        empanelmentDate: '2020-01-15'
    },
    {
        id: '2',
        name: 'Fortis Healthcare',
        type: 'hospital',
        address: 'Sector 62, Phase VIII',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        phone: '+91-120-500-4000',
        email: 'info@fortishealthcare.com',
        specialties: ['Emergency Medicine', 'Critical Care', 'Pediatrics'],
        rating: 4.6,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 300000,
        empanelmentDate: '2019-03-20'
    },
    {
        id: '3',
        name: 'City Health Clinic',
        type: 'clinic',
        address: 'MG Road, Commercial Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91-80-2555-4444',
        email: 'contact@cityhealthclinic.com',
        specialties: ['General Medicine', 'Dermatology'],
        rating: 4.2,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 50000,
        empanelmentDate: '2021-06-10'
    }
]

const dummyFraudAlerts: FraudAlert[] = [
    {
        id: '1',
        claimId: '1',
        type: 'excessive_billing',
        severity: 'medium',
        description: 'Treatment cost 30% higher than average for similar procedures',
        confidence: 0.75,
        detectedDate: '2025-07-29',
        status: 'active'
    },
    {
        id: '2',
        claimId: '2',
        type: 'suspicious_pattern',
        severity: 'low',
        description: 'Patient has multiple claims in short time period',
        confidence: 0.45,
        detectedDate: '2025-07-30',
        status: 'resolved',
        investigatorNotes: 'Verified legitimate medical emergency requiring multiple treatments'
    }
]

const dummyEligibilityChecks: EligibilityCheck[] = [
    {
        id: '1',
        patientId: '3',
        policyNumber: 'POL-2025-001',
        coverageType: 'Family Health Insurance',
        status: 'active',
        eligibleAmount: 500000,
        usedAmount: 25000,
        remainingAmount: 475000,
        validUntil: '2026-03-31',
        preAuthRequired: false,
        networkRestrictions: ['tier1', 'tier2']
    },
    {
        id: '2',
        patientId: '4',
        policyNumber: 'POL-2025-002',
        coverageType: 'Individual Health Plus',
        status: 'active',
        eligibleAmount: 300000,
        usedAmount: 45000,
        remainingAmount: 255000,
        validUntil: '2025-12-31',
        preAuthRequired: true,
        networkRestrictions: ['tier1']
    }
]

const dummyClaimSLAs: ClaimSLA[] = [
    {
        id: '1',
        claimId: '1',
        stage: 'approved',
        expectedCompletionDate: '2025-07-30',
        actualCompletionDate: '2025-07-28',
        isEscalated: false,
        escalationLevel: 0,
        remindersSent: 0,
        assignedTo: 'reviewer@insurance.com',
        priority: 'medium'
    },
    {
        id: '2',
        claimId: '2',
        stage: 'under_review',
        expectedCompletionDate: '2025-08-02',
        isEscalated: true,
        escalationLevel: 1,
        escalationDate: '2025-07-31',
        remindersSent: 2,
        assignedTo: 'senior.reviewer@insurance.com',
        priority: 'high'
    }
]

const dummyAadhaarValidations: AadhaarValidation[] = [
    {
        id: '1',
        userId: '3',
        aadhaarNumber: '1234-5678-9012',
        name: 'John Smith',
        dateOfBirth: '1985-03-15',
        gender: 'M',
        address: 'Block A, Sector 10, New Delhi',
        validationStatus: 'verified',
        validationDate: '2025-07-25'
    },
    {
        id: '2',
        userId: '4',
        aadhaarNumber: '9876-5432-1098',
        name: 'Emma Wilson',
        dateOfBirth: '1992-08-22',
        gender: 'F',
        address: 'Flat 203, Marine Drive, Mumbai',
        validationStatus: 'pending'
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
    
    // Advanced Features State
    providerNetwork: dummyProviderNetwork,
    fraudAlerts: dummyFraudAlerts,
    eligibilityChecks: dummyEligibilityChecks,
    claimSLAs: dummyClaimSLAs,
    aadhaarValidations: dummyAadhaarValidations,

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

    updateTreatment: (treatmentId, updates) => {
        set(state => ({
            treatments: state.treatments.map(t =>
                t.id === treatmentId ? { ...t, ...updates } : t
            )
        }))
    },

    deleteTreatment: (treatmentId) => {
        set(state => ({
            treatments: state.treatments.filter(t => t.id !== treatmentId)
        }))
    },

    addDischargeSummary: (treatmentId, summary) => {
        set(state => ({
            treatments: state.treatments.map(t =>
                t.id === treatmentId ? { ...t, dischargeSummary: summary } : t
            )
        }))
    },

    validateTreatmentForClaim: (treatmentId, isValid, notes) => {
        set(state => ({
            treatments: state.treatments.map(t =>
                t.id === treatmentId ? {
                    ...t,
                    validatedForClaim: isValid,
                    validationNotes: notes
                } : t
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
    },

    // Advanced Features Methods
    processOCR: async (file: File, reportId: string) => {
        // Simulate OCR processing
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockOCRData = {
                    extractedText: `Medical Report\nPatient: John Smith\nDate: 2025-07-25\nDiagnosis: Hypertension\nMedication: Lisinopril 10mg\nAmount: $150`,
                    confidence: 0.92,
                    extractedFields: {
                        patientName: 'John Smith',
                        doctorName: 'Dr. Sarah Johnson',
                        date: '2025-07-25',
                        diagnosis: 'Hypertension',
                        medications: ['Lisinopril 10mg'],
                        amount: 150,
                        hospitalName: 'City Medical Center'
                    }
                }

                set(state => ({
                    treatments: state.treatments.map(t => ({
                        ...t,
                        medicalReports: t.medicalReports?.map(r =>
                            r.id === reportId ? { ...r, ocrData: mockOCRData, status: 'processing' } : r
                        )
                    }))
                }))
                resolve()
            }, 2000)
        })
    },

    detectFraud: async (claimId: string) => {
        // Simulate AI fraud detection
        return new Promise((resolve) => {
            setTimeout(() => {
                const newAlert: FraudAlert = {
                    id: Date.now().toString(),
                    claimId,
                    type: 'suspicious_pattern',
                    severity: 'medium',
                    description: 'AI detected unusual billing pattern compared to historical data',
                    confidence: 0.67,
                    detectedDate: new Date().toISOString().split('T')[0],
                    status: 'active'
                }

                set(state => ({
                    fraudAlerts: [...state.fraudAlerts, newAlert]
                }))
                resolve([newAlert])
            }, 1500)
        })
    },

    checkEligibility: async (patientId: string, policyNumber: string) => {
        // Simulate eligibility check
        return new Promise((resolve) => {
            setTimeout(() => {
                const eligibility: EligibilityCheck = {
                    id: Date.now().toString(),
                    patientId,
                    policyNumber,
                    coverageType: 'Family Health Insurance',
                    status: 'active',
                    eligibleAmount: 500000,
                    usedAmount: 25000,
                    remainingAmount: 475000,
                    validUntil: '2026-03-31',
                    preAuthRequired: false,
                    networkRestrictions: ['tier1', 'tier2']
                }

                set(state => ({
                    eligibilityChecks: [...state.eligibilityChecks, eligibility]
                }))
                resolve(eligibility)
            }, 1000)
        })
    },

    validateAadhaar: async (aadhaarNumber: string, otp?: string) => {
        // Simulate Aadhaar validation
        return new Promise((resolve) => {
            setTimeout(() => {
                const validation: AadhaarValidation = {
                    id: Date.now().toString(),
                    userId: Date.now().toString(),
                    aadhaarNumber,
                    name: 'Verified User',
                    dateOfBirth: '1990-01-01',
                    gender: 'M',
                    address: 'Verified Address, City, State',
                    validationStatus: otp ? 'verified' : 'pending',
                    validationDate: otp ? new Date().toISOString().split('T')[0] : undefined,
                    otp
                }

                set(state => ({
                    aadhaarValidations: [...state.aadhaarValidations, validation]
                }))
                resolve(validation)
            }, 2000)
        })
    },

    searchProviders: (filters) => {
        const { providerNetwork } = get()
        return providerNetwork.filter(provider => {
            if (filters.city && !provider.city.toLowerCase().includes(filters.city.toLowerCase())) {
                return false
            }
            if (filters.specialty && !provider.specialties.some(s => 
                s.toLowerCase().includes(filters.specialty!.toLowerCase())
            )) {
                return false
            }
            if (filters.type && provider.type !== filters.type) {
                return false
            }
            return true
        })
    },

    updateClaimSLA: (claimId: string, stage: ClaimSLA['stage']) => {
        set(state => ({
            claimSLAs: state.claimSLAs.map(sla =>
                sla.claimId === claimId
                    ? {
                        ...sla,
                        stage,
                        actualCompletionDate: stage === 'approved' || stage === 'rejected'
                            ? new Date().toISOString().split('T')[0]
                            : undefined
                    }
                    : sla
            )
        }))
    },

    escalateClaim: (claimId: string) => {
        set(state => ({
            claimSLAs: state.claimSLAs.map(sla =>
                sla.claimId === claimId
                    ? {
                        ...sla,
                        isEscalated: true,
                        escalationLevel: sla.escalationLevel + 1,
                        escalationDate: new Date().toISOString().split('T')[0],
                        priority: 'urgent'
                    }
                    : sla
            )
        }))
    }
}))
