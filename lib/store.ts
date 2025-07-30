import { create } from 'zustand'

export interface Treatment {
    id: string
    doctorId: string
    doctorName: string
    patientId: string
    patientName: string
    diagnosis: string
    cost: number
    date: string
    status: 'pending' | 'submitted'
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
    status: 'pending' | 'approved' | 'rejected' | 'more-info-requested'
    submittedDate: string
    reviewedDate?: string
    insuranceNotes?: string
    riskScore?: number
    fraudFlags?: string[]
    eligibilityChecked?: boolean
    forwardedToBank?: boolean
}

export interface Policy {
    id: string
    name: string
    coverageType: string
    maxCoverage: number
    deductible: number
    coveragePercentage: number
    eligibilityCriteria: string[]
    isActive: boolean
}

export interface Communication {
    id: string
    claimId: string
    fromRole: 'doctor' | 'patient' | 'insurance' | 'bank'
    toRole: 'doctor' | 'patient' | 'insurance' | 'bank'
    message: string
    timestamp: string
    isRead: boolean
}

export interface FraudAlert {
    id: string
    claimId: string
    alertType: 'duplicate' | 'suspicious-amount' | 'frequent-claims' | 'invalid-diagnosis'
    severity: 'low' | 'medium' | 'high'
    description: string
    isResolved: boolean
}

export interface Payment {
    id: string
    claimId: string
    amount: number
    status: 'initiated' | 'completed'
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
    claims: Claim[]
    payments: Payment[]
    policies: Policy[]
    communications: Communication[]
    fraudAlerts: FraudAlert[]

    // Actions
    setCurrentRole: (role: 'doctor' | 'patient' | 'insurance' | 'bank') => void
    setCurrentUser: (user: User) => void
    addTreatment: (treatment: Omit<Treatment, 'id' | 'status'>) => void
    submitTreatment: (treatmentId: string) => void
    addClaim: (claim: Omit<Claim, 'id' | 'status' | 'submittedDate'>) => void
    reviewClaim: (claimId: string, status: 'approved' | 'rejected' | 'more-info-requested', notes?: string) => void
    addPayment: (payment: Omit<Payment, 'id' | 'status' | 'initiatedDate'>) => void
    completePayment: (paymentId: string, notes?: string) => void
    addCommunication: (communication: Omit<Communication, 'id' | 'timestamp' | 'isRead'>) => void
    markCommunicationRead: (communicationId: string) => void
    addPolicy: (policy: Omit<Policy, 'id'>) => void
    updatePolicy: (policyId: string, updates: Partial<Policy>) => void
    forwardClaimToBank: (claimId: string) => void
    checkEligibility: (claimId: string) => void
    calculateRiskScore: (claimId: string) => void
    sendQuickMessage: (claimId: string, fromRole: 'doctor' | 'patient' | 'insurance' | 'bank', toRole: 'doctor' | 'patient' | 'insurance' | 'bank', messageType: 'request-info' | 'provide-update' | 'ask-question' | 'custom', customMessage?: string) => void
    markAllCommunicationsRead: (role: 'doctor' | 'patient' | 'insurance' | 'bank') => void
    getCommunicationsForRole: (role: 'doctor' | 'patient' | 'insurance' | 'bank') => Communication[]
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
        cost: 250,
        date: '2025-07-25',
        status: 'submitted'
    },
    {
        id: '2',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        patientId: '4',
        patientName: 'Emma Wilson',
        diagnosis: 'Sprained Ankle Treatment',
        cost: 450,
        date: '2025-07-28',
        status: 'submitted'
    },
    {
        id: '3',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        patientId: '3',
        patientName: 'John Smith',
        diagnosis: 'Blood Pressure Check',
        cost: 150,
        date: '2025-07-29',
        status: 'submitted'
    },
    {
        id: '4',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        patientId: '3',
        patientName: 'John Smith',
        diagnosis: 'Back Pain Consultation',
        cost: 300,
        date: '2025-07-30',
        status: 'submitted'
    },
    {
        id: '5',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        patientId: '4',
        patientName: 'Emma Wilson',
        diagnosis: 'Follow-up Checkup',
        cost: 180,
        date: '2025-07-30',
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
    }
]

const dummyPolicies: Policy[] = [
    {
        id: '1',
        name: 'Standard Health Coverage',
        coverageType: 'Health',
        maxCoverage: 50000,
        deductible: 500,
        coveragePercentage: 80,
        eligibilityCriteria: ['Valid medical license', 'Approved diagnosis codes', 'Within coverage limits'],
        isActive: true
    },
    {
        id: '2',
        name: 'Premium Health Coverage',
        coverageType: 'Health',
        maxCoverage: 100000,
        deductible: 200,
        coveragePercentage: 90,
        eligibilityCriteria: ['Valid medical license', 'Approved diagnosis codes', 'Premium subscriber'],
        isActive: true
    }
]

const dummyCommunications: Communication[] = [
    {
        id: '1',
        claimId: '2',
        fromRole: 'insurance',
        toRole: 'doctor',
        message: 'Please provide additional X-ray images for the ankle injury claim.',
        timestamp: '2025-07-29T10:30:00Z',
        isRead: false
    },
    {
        id: '2',
        claimId: '1',
        fromRole: 'insurance',
        toRole: 'patient',
        message: 'Your claim for Annual Physical Examination has been approved. Payment of $200 will be processed shortly.',
        timestamp: '2025-07-27T14:20:00Z',
        isRead: true
    },
    {
        id: '3',
        claimId: '2',
        fromRole: 'doctor',
        toRole: 'insurance',
        message: 'Additional X-ray images have been uploaded to the patient portal for review.',
        timestamp: '2025-07-29T16:45:00Z',
        isRead: false
    },
    {
        id: '4',
        claimId: '2',
        fromRole: 'patient',
        toRole: 'insurance',
        message: 'I have provided all requested documentation. When can I expect a decision on my claim?',
        timestamp: '2025-07-30T09:15:00Z',
        isRead: false
    }
]

const dummyFraudAlerts: FraudAlert[] = [
    {
        id: '1',
        claimId: '2',
        alertType: 'suspicious-amount',
        severity: 'medium',
        description: 'Claim amount is 200% higher than average for this diagnosis',
        isResolved: false
    }
]

export const useAppStore = create<AppState>((set, get) => ({
    currentUser: dummyUsers[0],
    currentRole: 'doctor',
    users: dummyUsers,
    treatments: dummyTreatments,
    claims: dummyClaims,
    payments: dummyPayments,
    policies: dummyPolicies,
    communications: dummyCommunications,
    fraudAlerts: dummyFraudAlerts,

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

    addClaim: (claim) => {
        const newClaim: Claim = {
            ...claim,
            id: Date.now().toString(),
            status: 'pending',
            submittedDate: new Date().toISOString().split('T')[0],
            riskScore: Math.floor(Math.random() * 100),
            fraudFlags: [],
            eligibilityChecked: false,
            forwardedToBank: false
        }
        set(state => ({ claims: [...state.claims, newClaim] }))
        
        // Auto-calculate risk score and check for fraud
        get().calculateRiskScore(newClaim.id)

        // Auto-generate communication for new claim
        get().addCommunication({
            claimId: newClaim.id,
            fromRole: 'patient',
            toRole: 'insurance',
            message: `New insurance claim submitted for ${claim.diagnosis}. Treatment cost: $${claim.cost}. Please review the attached documents.`
        })

        // Notify insurance about new claim
        get().addCommunication({
            claimId: newClaim.id,
            fromRole: 'insurance',
            toRole: 'patient',
            message: `Thank you for submitting your claim. Claim ID: ${newClaim.id}. We will review your claim within 3-5 business days.`
        })
    },

    reviewClaim: (claimId, status, notes) => {
        set(state => ({
            claims: state.claims.map(c =>
                c.id === claimId
                    ? {
                        ...c,
                        status,
                        reviewedDate: new Date().toISOString().split('T')[0],
                        insuranceNotes: notes,
                        eligibilityChecked: true
                    }
                    : c
            )
        }))

        // Auto-generate communication based on status
        const claim = get().claims.find(c => c.id === claimId)
        if (claim) {
            let autoMessage = ''
            let toRole: 'doctor' | 'patient' | 'insurance' | 'bank' = 'patient'

            switch (status) {
                case 'approved':
                    autoMessage = `Your claim for ${claim.diagnosis} has been approved. Payment of $${Math.floor(claim.cost * 0.8)} will be processed shortly.`
                    toRole = 'patient'
                    break
                case 'rejected':
                    autoMessage = `Your claim for ${claim.diagnosis} has been rejected. Reason: ${notes || 'Does not meet policy requirements'}`
                    toRole = 'patient'
                    break
                case 'more-info-requested':
                    autoMessage = `Additional information required for claim ${claimId} - ${claim.diagnosis}. ${notes || 'Please provide additional documentation.'}`
                    toRole = 'doctor'
                    break
            }

            // Add auto-generated communication
            get().addCommunication({
                claimId,
                fromRole: 'insurance',
                toRole,
                message: autoMessage
            })
        }

        // Auto-create payment for approved claims
        if (status === 'approved') {
            if (claim) {
                const policy = get().policies.find(p => p.isActive)
                const coveragePercentage = policy?.coveragePercentage || 80
                const payment: Payment = {
                    id: Date.now().toString(),
                    claimId,
                    amount: Math.floor(claim.cost * (coveragePercentage / 100)),
                    status: 'initiated',
                    initiatedDate: new Date().toISOString().split('T')[0]
                }
                set(state => ({ payments: [...state.payments, payment] }))
                
                // Auto-forward to bank
                setTimeout(() => get().forwardClaimToBank(claimId), 100)
            }
        }
    },

    addPayment: (payment) => {
        const newPayment: Payment = {
            ...payment,
            id: Date.now().toString(),
            status: 'initiated',
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

    addCommunication: (communication) => {
        const newCommunication: Communication = {
            ...communication,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            isRead: false
        }
        set(state => ({ communications: [...state.communications, newCommunication] }))
    },

    markCommunicationRead: (communicationId) => {
        set(state => ({
            communications: state.communications.map(c =>
                c.id === communicationId ? { ...c, isRead: true } : c
            )
        }))
    },

    addPolicy: (policy) => {
        const newPolicy: Policy = {
            ...policy,
            id: Date.now().toString()
        }
        set(state => ({ policies: [...state.policies, newPolicy] }))
    },

    updatePolicy: (policyId, updates) => {
        set(state => ({
            policies: state.policies.map(p =>
                p.id === policyId ? { ...p, ...updates } : p
            )
        }))
    },

    forwardClaimToBank: (claimId) => {
        set(state => ({
            claims: state.claims.map(c =>
                c.id === claimId ? { ...c, forwardedToBank: true } : c
            )
        }))
    },

    checkEligibility: (claimId) => {
        const claim = get().claims.find(c => c.id === claimId)
        if (claim) {
            // Simulate eligibility check
            const isEligible = Math.random() > 0.1 // 90% eligibility rate
            set(state => ({
                claims: state.claims.map(c =>
                    c.id === claimId ? { ...c, eligibilityChecked: true } : c
                )
            }))
        }
    },

    calculateRiskScore: (claimId) => {
        const claim = get().claims.find(c => c.id === claimId)
        if (claim) {
            let riskScore = Math.floor(Math.random() * 100)
            const fraudFlags: string[] = []
            
            // Check for fraud indicators
            if (claim.cost > 1000) {
                riskScore += 20
                fraudFlags.push('High cost claim')
            }
            
            const recentClaims = get().claims.filter(c => 
                c.patientId === claim.patientId && 
                c.id !== claim.id &&
                new Date(c.submittedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
            
            if (recentClaims.length > 2) {
                riskScore += 30
                fraudFlags.push('Multiple recent claims')
            }
            
            riskScore = Math.min(riskScore, 100)
            
            set(state => ({
                claims: state.claims.map(c =>
                    c.id === claimId ? { ...c, riskScore, fraudFlags } : c
                )
            }))
            
            // Create fraud alert if high risk
            if (riskScore > 70) {
                const fraudAlert: FraudAlert = {
                    id: Date.now().toString(),
                    claimId,
                    alertType: 'suspicious-amount',
                    severity: riskScore > 85 ? 'high' : 'medium',
                    description: `High risk score detected: ${riskScore}/100. ${fraudFlags.join(', ')}`,
                    isResolved: false
                }
                set(state => ({ fraudAlerts: [...state.fraudAlerts, fraudAlert] }))
            }
        }
    },

    // Dynamic Communication Functions
    sendQuickMessage: (claimId, fromRole, toRole, messageType, customMessage) => {
        const claim = get().claims.find(c => c.id === claimId)
        let message = customMessage || ''

        if (!customMessage) {
            switch (messageType) {
                case 'request-info':
                    message = `Additional information is needed for claim ${claimId}. Please provide the required documentation.`
                    break
                case 'provide-update':
                    message = `Update on claim ${claimId}: ${claim?.diagnosis || 'claim'} is being processed.`
                    break
                case 'ask-question':
                    message = `I have a question regarding claim ${claimId}. Please clarify the treatment details.`
                    break
                default:
                    message = `Message regarding claim ${claimId}`
            }
        }

        get().addCommunication({
            claimId,
            fromRole,
            toRole,
            message
        })
    },

    markAllCommunicationsRead: (role) => {
        set(state => ({
            communications: state.communications.map(c =>
                c.toRole === role ? { ...c, isRead: true } : c
            )
        }))
    },

    getCommunicationsForRole: (role) => {
        return get().communications.filter(c => c.toRole === role || c.fromRole === role)
    }
}))
