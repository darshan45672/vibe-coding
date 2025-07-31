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
    },
    {
        id: '4',
        name: 'Max Healthcare',
        type: 'hospital',
        address: 'Press Enclave Road, Saket',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110017',
        phone: '+91-11-2651-5050',
        email: 'info@maxhealthcare.com',
        specialties: ['Cardiac Surgery', 'Nephrology', 'Gastroenterology'],
        rating: 4.7,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 400000,
        empanelmentDate: '2018-11-25'
    },
    {
        id: '5',
        name: 'Manipal Hospital',
        type: 'hospital',
        address: 'HAL Airport Road, Kodihalli',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560017',
        phone: '+91-80-2502-4444',
        email: 'info@manipalhospitals.com',
        specialties: ['Oncology', 'Neurosurgery', 'Pulmonology'],
        rating: 4.5,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 350000,
        empanelmentDate: '2019-07-12'
    },
    {
        id: '6',
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        type: 'hospital',
        address: 'Rao Saheb Achutrao Patwardhan Marg',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        phone: '+91-22-4269-6969',
        email: 'info@kdahospital.com',
        specialties: ['Organ Transplant', 'Robotic Surgery', 'Cancer Care'],
        rating: 4.9,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 600000,
        empanelmentDate: '2017-05-30'
    },
    {
        id: '7',
        name: 'Medanta - The Medicity',
        type: 'hospital',
        address: 'Sector 38, Gurgaon',
        city: 'Gurgaon',
        state: 'Haryana',
        pincode: '122001',
        phone: '+91-124-414-1414',
        email: 'info@medanta.org',
        specialties: ['Heart Surgery', 'Liver Transplant', 'Neurology'],
        rating: 4.6,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 450000,
        empanelmentDate: '2018-02-14'
    },
    {
        id: '8',
        name: 'Narayana Health',
        type: 'hospital',
        address: '258/A, Bommasandra Industrial Area',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560099',
        phone: '+91-80-7122-2222',
        email: 'info@narayanahealth.org',
        specialties: ['Pediatric Surgery', 'Cardiology', 'Orthopedics'],
        rating: 4.4,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 250000,
        empanelmentDate: '2020-09-18'
    },
    {
        id: '9',
        name: 'AIIMS Delhi',
        type: 'hospital',
        address: 'Ansari Nagar, Aurobindo Marg',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110029',
        phone: '+91-11-2658-8500',
        email: 'info@aiims.edu',
        specialties: ['Research Medicine', 'Emergency Care', 'All Specialties'],
        rating: 4.8,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 200000,
        empanelmentDate: '2015-01-01'
    },
    {
        id: '10',
        name: 'Asian Heart Institute',
        type: 'hospital',
        address: 'G/N Block, BKC, Bandra Kurla Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
        phone: '+91-22-6698-6666',
        email: 'info@asianheart.org',
        specialties: ['Cardiac Surgery', 'Interventional Cardiology', 'Heart Transplant'],
        rating: 4.7,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 500000,
        empanelmentDate: '2019-03-22'
    },
    {
        id: '11',
        name: 'Cloudnine Hospital',
        type: 'hospital',
        address: '1533, 9th Main, 3rd Block',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        phone: '+91-80-4040-8888',
        email: 'info@cloudninehospitals.com',
        specialties: ['Maternity', 'Pediatrics', 'Gynecology'],
        rating: 4.3,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 150000,
        empanelmentDate: '2021-01-10'
    },
    {
        id: '12',
        name: 'Rajiv Gandhi Cancer Institute',
        type: 'hospital',
        address: 'Sector 5, Rohini',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110085',
        phone: '+91-11-4705-8000',
        email: 'info@rgcirc.org',
        specialties: ['Oncology', 'Radiation Therapy', 'Surgical Oncology'],
        rating: 4.6,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 400000,
        empanelmentDate: '2018-08-15'
    },
    {
        id: '13',
        name: 'Wockhardt Hospital',
        type: 'hospital',
        address: '1877, Dr Anand Rao Nair Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400011',
        phone: '+91-22-2659-8888',
        email: 'info@wockhardthospitals.com',
        specialties: ['Minimal Access Surgery', 'Joint Replacement', 'Spine Surgery'],
        rating: 4.2,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 200000,
        empanelmentDate: '2020-04-05'
    },
    {
        id: '14',
        name: 'Columbia Asia Hospital',
        type: 'hospital',
        address: 'Kirloskar Business Park, Bellary Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560024',
        phone: '+91-80-6614-6666',
        email: 'info@columbiaasia.com',
        specialties: ['Emergency Medicine', 'Internal Medicine', 'Surgery'],
        rating: 4.1,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 180000,
        empanelmentDate: '2021-11-20'
    },
    {
        id: '15',
        name: 'Sankara Nethralaya',
        type: 'hospital',
        address: '18, College Road, Nungambakkam',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600006',
        phone: '+91-44-2827-1616',
        email: 'info@sankaranethralaya.org',
        specialties: ['Ophthalmology', 'Eye Surgery', 'Retinal Diseases'],
        rating: 4.8,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 250000,
        empanelmentDate: '2017-12-08'
    },
    {
        id: '16',
        name: 'Breach Candy Hospital',
        type: 'hospital',
        address: '60-A, Bhulabhai Desai Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400026',
        phone: '+91-22-2367-8888',
        email: 'info@breachcandyhospital.org',
        specialties: ['General Medicine', 'Surgery', 'Intensive Care'],
        rating: 4.4,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 350000,
        empanelmentDate: '2016-06-12'
    },
    {
        id: '17',
        name: 'Care Hospital',
        type: 'hospital',
        address: 'Road No. 1, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        phone: '+91-40-6719-1000',
        email: 'info@carehospitals.com',
        specialties: ['Cardiology', 'Neurology', 'Gastroenterology'],
        rating: 4.3,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 220000,
        empanelmentDate: '2019-10-30'
    },
    {
        id: '18',
        name: 'Artemis Hospital',
        type: 'hospital',
        address: 'Sector 51, Gurgaon',
        city: 'Gurgaon',
        state: 'Haryana',
        pincode: '122001',
        phone: '+91-124-511-1111',
        email: 'info@artemishospitals.com',
        specialties: ['Heart Surgery', 'Organ Transplant', 'Cancer Treatment'],
        rating: 4.5,
        isApproved: true,
        networkTier: 'tier1',
        cashlessLimit: 400000,
        empanelmentDate: '2018-01-25'
    },
    {
        id: '19',
        name: 'Lilavati Hospital',
        type: 'hospital',
        address: 'A-791, Bandra Reclamation',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        phone: '+91-22-2675-1000',
        email: 'info@lilavatihospital.com',
        specialties: ['Emergency Medicine', 'Trauma Care', 'General Surgery'],
        rating: 4.2,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 275000,
        empanelmentDate: '2020-02-14'
    },
    {
        id: '20',
        name: 'Sterling Hospital',
        type: 'hospital',
        address: 'Behind Drive-in Cinema, Memnagar',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380052',
        phone: '+91-79-6677-0000',
        email: 'info@sterlinghospitals.com',
        specialties: ['Neurosurgery', 'Urology', 'Plastic Surgery'],
        rating: 4.1,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 180000,
        empanelmentDate: '2021-05-18'
    },
    {
        id: '21',
        name: 'Prime Care Clinic',
        type: 'clinic',
        address: 'Connaught Place, Central Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91-11-2334-5566',
        email: 'info@primecareclinic.com',
        specialties: ['General Medicine', 'Family Medicine'],
        rating: 4.0,
        isApproved: true,
        networkTier: 'tier3',
        cashlessLimit: 25000,
        empanelmentDate: '2022-01-15'
    },
    {
        id: '22',
        name: 'MedPlus Diagnostics',
        type: 'diagnostic_center',
        address: 'Hitech City Road, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        phone: '+91-40-4455-6677',
        email: 'info@medplusdiagnostics.com',
        specialties: ['Laboratory Tests', 'Radiology', 'Health Checkups'],
        rating: 4.3,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 75000,
        empanelmentDate: '2020-08-22'
    },
    {
        id: '23',
        name: 'Apollo Pharmacy',
        type: 'pharmacy',
        address: 'Multiple Locations',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        phone: '+91-44-3988-8888',
        email: 'info@apollopharmacy.in',
        specialties: ['Prescription Medicines', 'OTC Drugs', 'Health Products'],
        rating: 4.2,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 50000,
        empanelmentDate: '2019-12-10'
    },
    {
        id: '24',
        name: 'Wellness Clinic',
        type: 'clinic',
        address: 'Koramangala 4th Block',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        phone: '+91-80-4123-4567',
        email: 'info@wellnessclinic.com',
        specialties: ['Preventive Care', 'Vaccination', 'Health Screening'],
        rating: 3.9,
        isApproved: true,
        networkTier: 'tier3',
        cashlessLimit: 30000,
        empanelmentDate: '2022-03-05'
    },
    {
        id: '25',
        name: 'Metro Diagnostics',
        type: 'diagnostic_center',
        address: 'Andheri East, Near Metro Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        phone: '+91-22-6789-0123',
        email: 'info@metrodiagnostics.com',
        specialties: ['MRI', 'CT Scan', 'Blood Tests', 'ECG'],
        rating: 4.1,
        isApproved: true,
        networkTier: 'tier2',
        cashlessLimit: 85000,
        empanelmentDate: '2021-07-30'
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
    // Empty by default - users need to manually validate their ID
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
        // AI-powered OCR processing - analyzes ANY medical document regardless of filename
        return new Promise((resolve, reject) => {
            // Simulate advanced AI-powered OCR processing
            setTimeout(async () => {
                try {
                    // Generate random document type for realistic medical data
                    const documentTypes = [
                        {
                            type: 'bill',
                            text: `MEDICAL BILL\n\n` +
                                `Hospital: Apollo Medical Center\n` +
                                `Patient Name: Rahul Sharma\n` +
                                `Patient ID: PAT-2025-1234\n` +
                                `Doctor: Dr. Priya Patel\n` +
                                `Date of Service: ${new Date().toISOString().split('T')[0]}\n` +
                                `Diagnosis: General Health Checkup\n\n` +
                                `CHARGES:\n` +
                                `Consultation Fee: ₹500\n` +
                                `Laboratory Tests: ₹800\n` +
                                `Medicines: ₹300\n` +
                                `Total Amount: ₹1,600\n\n` +
                                `Payment Status: Paid\n` +
                                `Insurance Claim: Eligible`,
                            fields: {
                                patientName: 'Rahul Sharma',
                                doctorName: 'Dr. Priya Patel',
                                date: new Date().toISOString().split('T')[0],
                                diagnosis: 'General Health Checkup',
                                amount: 1600,
                                hospitalName: 'Apollo Medical Center'
                            },
                            confidence: 0.92
                        },
                        {
                            type: 'prescription',
                            text: `PRESCRIPTION\n\n` +
                                `Doctor: Dr. Amit Kumar\n` +
                                `Hospital: Max Healthcare\n` +
                                `Patient: Priya Singh\n` +
                                `Date: ${new Date().toISOString().split('T')[0]}\n` +
                                `Age: 34 years\n\n` +
                                `DIAGNOSIS: Hypertension\n\n` +
                                `MEDICATIONS:\n` +
                                `1. Amlodipine 5mg - Once daily\n` +
                                `2. Metformin 500mg - Twice daily\n` +
                                `3. Vitamin D3 - Once weekly\n\n` +
                                `Follow-up: After 2 weeks\n` +
                                `Doctor's Signature: Dr. Amit Kumar`,
                            fields: {
                                patientName: 'Priya Singh',
                                doctorName: 'Dr. Amit Kumar',
                                date: new Date().toISOString().split('T')[0],
                                diagnosis: 'Hypertension',
                                hospitalName: 'Max Healthcare',
                                medications: ['Amlodipine 5mg', 'Metformin 500mg', 'Vitamin D3']
                            },
                            confidence: 0.89
                        },
                        {
                            type: 'lab_report',
                            text: `LABORATORY REPORT\n\n` +
                                `Lab: City Diagnostics\n` +
                                `Patient: Anjali Gupta\n` +
                                `Age: 28 years, Female\n` +
                                `Date: ${new Date().toISOString().split('T')[0]}\n` +
                                `Ref. Doctor: Dr. Sarah Johnson\n\n` +
                                `COMPLETE BLOOD COUNT:\n` +
                                `Hemoglobin: 12.5 g/dL (Normal: 12-15)\n` +
                                `WBC Count: 7,200/μL (Normal: 4,000-11,000)\n` +
                                `Platelet Count: 2,50,000/μL (Normal: 1,50,000-4,50,000)\n\n` +
                                `BLOOD GLUCOSE:\n` +
                                `Fasting: 95 mg/dL (Normal: 70-100)\n` +
                                `Post Meal: 140 mg/dL (Normal: <140)\n\n` +
                                `RESULT: All parameters within normal limits`,
                            fields: {
                                patientName: 'Anjali Gupta',
                                doctorName: 'Dr. Sarah Johnson',
                                date: new Date().toISOString().split('T')[0],
                                diagnosis: 'Complete Blood Count - Normal',
                                hospitalName: 'City Diagnostics'
                            },
                            confidence: 0.87
                        },
                        {
                            type: 'discharge_summary',
                            text: `DISCHARGE SUMMARY\n\n` +
                                `Hospital: Fortis Healthcare\n` +
                                `Patient: Vikram Reddy\n` +
                                `Age: 45 years, Male\n` +
                                `Admission Date: ${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}\n` +
                                `Discharge Date: ${new Date().toISOString().split('T')[0]}\n` +
                                `Attending Doctor: Dr. Michael Chen\n\n` +
                                `DIAGNOSIS: Acute Appendicitis\n` +
                                `PROCEDURE: Laparoscopic Appendectomy\n\n` +
                                `TREATMENT SUMMARY:\n` +
                                `Patient admitted with acute abdominal pain.\n` +
                                `Successful laparoscopic appendectomy performed.\n` +
                                `Post-operative recovery was uneventful.\n\n` +
                                `DISCHARGE MEDICATIONS:\n` +
                                `1. Paracetamol 500mg - As needed for pain\n` +
                                `2. Amoxicillin 500mg - Thrice daily for 7 days\n\n` +
                                `Follow-up: 1 week`,
                            fields: {
                                patientName: 'Vikram Reddy',
                                doctorName: 'Dr. Michael Chen',
                                date: new Date().toISOString().split('T')[0],
                                diagnosis: 'Acute Appendicitis - Laparoscopic Appendectomy',
                                hospitalName: 'Fortis Healthcare',
                                medications: ['Paracetamol 500mg', 'Amoxicillin 500mg']
                            },
                            confidence: 0.91
                        },
                        {
                            type: 'radiology',
                            text: `RADIOLOGY REPORT\n\n` +
                                `Hospital: Manipal Hospital\n` +
                                `Patient: Neha Agarwal\n` +
                                `Age: 35 years, Female\n` +
                                `Study Date: ${new Date().toISOString().split('T')[0]}\n` +
                                `Radiologist: Dr. Rajesh Khanna\n` +
                                `Referring Doctor: Dr. Sarah Johnson\n\n` +
                                `STUDY: Chest X-Ray PA View\n\n` +
                                `FINDINGS:\n` +
                                `- Heart size and shape are normal\n` +
                                `- Lung fields are clear bilaterally\n` +
                                `- No pleural effusion or pneumothorax\n` +
                                `- Bony structures appear normal\n\n` +
                                `IMPRESSION: Normal chest X-ray`,
                            fields: {
                                patientName: 'Neha Agarwal',
                                doctorName: 'Dr. Rajesh Khanna',
                                date: new Date().toISOString().split('T')[0],
                                diagnosis: 'Normal chest X-ray',
                                hospitalName: 'Manipal Hospital'
                            },
                            confidence: 0.88
                        },
                        {
                            type: 'consultation',
                            text: `CONSULTATION REPORT\n\n` +
                                `Hospital: AIIMS Delhi\n` +
                                `Patient: Rohan Gupta\n` +
                                `Age: 42 years, Male\n` +
                                `Date: ${new Date().toISOString().split('T')[0]}\n` +
                                `Consulting Doctor: Dr. Kavya Sharma\n\n` +
                                `CHIEF COMPLAINT: Chest pain and shortness of breath\n\n` +
                                `EXAMINATION FINDINGS:\n` +
                                `- Blood Pressure: 140/90 mmHg\n` +
                                `- Heart Rate: 85 bpm\n` +
                                `- Respiratory Rate: 18/min\n` +
                                `- ECG: Normal sinus rhythm\n\n` +
                                `DIAGNOSIS: Mild hypertension, anxiety-related chest discomfort\n\n` +
                                `TREATMENT PLAN:\n` +
                                `- Lifestyle modifications\n` +
                                `- Regular BP monitoring\n` +
                                `- Follow-up in 4 weeks`,
                            fields: {
                                patientName: 'Rohan Gupta',
                                doctorName: 'Dr. Kavya Sharma',
                                date: new Date().toISOString().split('T')[0],
                                diagnosis: 'Mild hypertension, anxiety-related chest discomfort',
                                hospitalName: 'AIIMS Delhi',
                                amount: 750
                            },
                            confidence: 0.85
                        }
                    ]

                    // Randomly select a medical document type to simulate intelligent OCR
                    const randomDoc = documentTypes[Math.floor(Math.random() * documentTypes.length)]

                    // Add file information to make it realistic
                    const extractedText = `${randomDoc.text}\n\n---\nFile: ${file.name}\nSize: ${Math.round(file.size / 1024)}KB\nProcessed: ${new Date().toISOString()}`

                    // Add fraud risk assessment
                    const fraudScore = Math.random() * 0.3 // Low fraud risk for most documents

                    const ocrData = {
                        extractedText,
                        confidence: randomDoc.confidence,
                        extractedFields: randomDoc.fields
                    }

                    set(state => ({
                        treatments: state.treatments.map(t => ({
                            ...t,
                            medicalReports: t.medicalReports?.map(r =>
                                r.id === reportId ? { 
                                    ...r, 
                                    ocrData, 
                                    status: 'verified',
                                    fraudScore 
                                } : r
                            )
                        }))
                    }))
                    
                    resolve()
                } catch (error) {
                    reject(error)
                }
            }, 2000) // Simulate processing time
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
        // Simulate ID validation with realistic flow
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!otp) {
                    // First step: Send OTP
                    const pendingValidation: AadhaarValidation = {
                        id: Date.now().toString(),
                        userId: Date.now().toString(),
                        aadhaarNumber,
                        name: 'Processing...',
                        dateOfBirth: '',
                        gender: 'M',
                        address: '',
                        validationStatus: 'pending',
                        otp: Math.floor(100000 + Math.random() * 900000).toString() // Generate 6-digit OTP
                    }

                    set(state => ({
                        aadhaarValidations: [...state.aadhaarValidations, pendingValidation]
                    }))
                    resolve(pendingValidation)
                } else {
                    // Second step: Verify OTP and complete validation
                    const existingValidation = get().aadhaarValidations.find(
                        v => v.aadhaarNumber === aadhaarNumber && v.validationStatus === 'pending'
                    )

                    if (!existingValidation) {
                        reject(new Error('Validation session expired. Please start over.'))
                        return
                    }

                    // Simulate OTP verification (in real scenario, verify against sent OTP)
                    if (otp.length === 6) {
                        const verifiedValidation: AadhaarValidation = {
                            ...existingValidation,
                            name: 'John Doe', // In real scenario, fetch from government API
                            dateOfBirth: '1990-01-01',
                            address: 'Verified Address, City, State',
                            validationStatus: 'verified',
                            validationDate: new Date().toISOString().split('T')[0]
                        }

                        set(state => ({
                            aadhaarValidations: state.aadhaarValidations.map(v =>
                                v.id === existingValidation.id ? verifiedValidation : v
                            )
                        }))
                        resolve(verifiedValidation)
                    } else {
                        reject(new Error('Invalid OTP. Please try again.'))
                    }
                }
            }, 1500)
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
