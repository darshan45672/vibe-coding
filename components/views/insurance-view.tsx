"use client"

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    CalendarDays, DollarSign, FileText, CheckCircle, XCircle, Clock, Eye, 
    Filter, Search, AlertTriangle, MessageSquare, BarChart3, Shield,
    Users, TrendingUp, Activity, Plus, Edit2, ArrowRight, 
    Download, Upload, Settings, RefreshCw
} from 'lucide-react'

type ViewMode = 'dashboard' | 'claims' | 'policies' | 'analytics'

export function InsuranceView() {
    const { 
        claims, policies, fraudAlerts, 
        reviewClaim, addPolicy, updatePolicy, 
        forwardClaimToBank, checkEligibility
    } = useAppStore()
    
    const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState('')
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [showDocuments, setShowDocuments] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
    const [showAddPolicy, setShowAddPolicy] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [newPolicy, setNewPolicy] = useState({
        name: '',
        coverageType: '',
        maxCoverage: 0,
        deductible: 0,
        coveragePercentage: 80,
        eligibilityCriteria: [''],
        isActive: true
    })

    const pendingClaims = claims.filter(c => c.status === 'pending')
    const reviewedClaims = claims.filter(c => c.status !== 'pending')
    const approvedClaims = claims.filter(c => c.status === 'approved')
    const rejectedClaims = claims.filter(c => c.status === 'rejected')
    const moreInfoRequested = claims.filter(c => c.status === 'more-info-requested')
    const highRiskClaims = claims.filter(c => (c.riskScore || 0) > 70)
    const unresolvedFraudAlerts = fraudAlerts.filter(f => !f.isResolved)

    // Filter claims based on search and status
    const filteredClaims = claims.filter(claim => {
        const matchesSearch = searchTerm === '' || 
            claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.id.includes(searchTerm)
        
        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
        
        return matchesSearch && matchesStatus
    })

    const handleReview = (claimId: string, status: 'approved' | 'rejected' | 'more-info-requested') => {
        reviewClaim(claimId, status, reviewNotes)
        setSelectedClaim(null)
        setReviewNotes('')
    }

    const handleAddPolicy = () => {
        if (newPolicy.name && newPolicy.coverageType) {
            addPolicy({
                ...newPolicy,
                eligibilityCriteria: newPolicy.eligibilityCriteria.filter(c => c.trim() !== '')
            })
            setNewPolicy({
                name: '',
                coverageType: '',
                maxCoverage: 0,
                deductible: 0,
                coveragePercentage: 80,
                eligibilityCriteria: [''],
                isActive: true
            })
            setShowAddPolicy(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
            case 'more-info-requested': return <MessageSquare className="w-4 h-4 text-blue-500" />
            default: return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning'
            case 'approved': return 'default'
            case 'rejected': return 'destructive'
            case 'more-info-requested': return 'secondary'
            default: return 'secondary'
        }
    }

    const getRiskColor = (riskScore: number) => {
        if (riskScore > 70) return 'text-red-600'
        if (riskScore > 40) return 'text-yellow-600'
        return 'text-green-600'
    }

    const selectedClaimData = claims.find(c => c.id === selectedClaim)

    // Auto-refresh effect
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Simulate real-time updates - in a real app, this would fetch new data
                console.log('Auto-refreshing data...')
            }, 30000) // Refresh every 30 seconds

            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    // Analytics calculations
    const totalClaimsValue = claims.reduce((sum, claim) => sum + claim.cost, 0)
    const approvedValue = approvedClaims.reduce((sum, claim) => sum + claim.cost, 0)
    const approvalRate = claims.length > 0 ? (approvedClaims.length / claims.length) * 100 : 0
    const averageProcessingTime = 2.5 // days (mock data)
    const fraudPreventionSavings = unresolvedFraudAlerts.reduce((sum, alert) => {
        const claim = claims.find(c => c.id === alert.claimId)
        return sum + (claim?.cost || 0) * 0.1 // Assume 10% savings from fraud prevention
    }, 0)

    return (
        <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Insurance Management System</h2>
                    <p className="text-gray-600">Comprehensive claims processing and policy management</p>
                </div>
                <div className="flex items-center gap-2">
                    {unresolvedFraudAlerts.length > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {unresolvedFraudAlerts.length} Fraud Alerts
                        </Badge>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-1 ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}
                    >
                        <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                        Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="claims" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Claims ({claims.length})
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Policies ({policies.length})
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-yellow-600">{pendingClaims.length}</p>
                                    <p className="text-sm text-gray-600">Pending Reviews</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{approvedClaims.length}</p>
                                    <p className="text-sm text-gray-600">Approved</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{rejectedClaims.length}</p>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{moreInfoRequested.length}</p>
                                    <p className="text-sm text-gray-600">Info Requested</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-blue-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Risk Assessment Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{highRiskClaims.length}</p>
                                    <p className="text-sm text-gray-600">High Risk Claims</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">{unresolvedFraudAlerts.length}</p>
                                    <p className="text-sm text-gray-600">Fraud Alerts</p>
                                </div>
                                <Shield className="w-8 h-8 text-orange-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">${fraudPreventionSavings.toFixed(0)}</p>
                                    <p className="text-sm text-gray-600">Fraud Prevention Savings</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-purple-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Recent Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Recent High-Priority Claims
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {highRiskClaims.slice(0, 5).map(claim => (
                                        <div key={claim.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">#{claim.id} - {claim.patientName}</p>
                                                <p className="text-sm text-gray-600">${claim.cost} • Risk: {claim.riskScore}/100</p>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedClaim(claim.id)
                                                    setViewMode('claims')
                                                }}
                                            >
                                                Review
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Claims Tab */}
                <TabsContent value="claims" className="space-y-6">
                    {/* Search and Filter */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Claims Dashboard & Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by patient, doctor, diagnosis, or claim ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Claims</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="more-info-requested">More Info Requested</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Claims Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Claims ({filteredClaims.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredClaims.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No claims match your filters.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Claim ID</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Risk Score</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredClaims.map(claim => (
                                            <TableRow key={claim.id} className={claim.riskScore && claim.riskScore > 70 ? 'bg-red-50' : ''}>
                                                <TableCell className="font-medium">#{claim.id}</TableCell>
                                                <TableCell>{claim.patientName}</TableCell>
                                                <TableCell>{claim.doctorName}</TableCell>
                                                <TableCell>{claim.diagnosis}</TableCell>
                                                <TableCell className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" />
                                                    ${claim.cost}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={getRiskColor(claim.riskScore || 0)}>
                                                        {claim.riskScore || 0}/100
                                                    </span>
                                                </TableCell>
                                                <TableCell className="flex items-center gap-2">
                                                    <CalendarDays className="w-4 h-4" />
                                                    {claim.submittedDate}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(claim.status)}
                                                        <Badge variant={getStatusColor(claim.status) as any}>
                                                            {claim.status.replace('-', ' ')}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedClaim(claim.id)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        {claim.status === 'approved' && !claim.forwardedToBank && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => forwardClaimToBank(claim.id)}
                                                            >
                                                                <ArrowRight className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Detailed Claim Review */}
                    {selectedClaim && selectedClaimData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Review Claim #{selectedClaim}
                                    {selectedClaimData.riskScore && selectedClaimData.riskScore > 70 && (
                                        <Badge variant="destructive" className="ml-2">High Risk</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Claim Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Patient Information</h4>
                                        <p className="text-gray-600">{selectedClaimData.patientName}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Doctor</h4>
                                        <p className="text-gray-600">{selectedClaimData.doctorName}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Diagnosis</h4>
                                        <p className="text-gray-600">{selectedClaimData.diagnosis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Treatment Cost</h4>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            ${selectedClaimData.cost}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                                        <p className={`font-semibold ${getRiskColor(selectedClaimData.riskScore || 0)}`}>
                                            {selectedClaimData.riskScore || 0}/100
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Eligibility Status</h4>
                                        <Badge variant={selectedClaimData.eligibilityChecked ? 'default' : 'secondary'}>
                                            {selectedClaimData.eligibilityChecked ? 'Verified' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Fraud Flags */}
                                {selectedClaimData.fraudFlags && selectedClaimData.fraudFlags.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Fraud Flags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedClaimData.fraudFlags.map((flag, index) => (
                                                <Badge key={index} variant="destructive">{flag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Medical Documents */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">Medical Documents & Bills</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDocuments(!showDocuments)}
                                        >
                                            {showDocuments ? 'Hide' : 'View'} Documents
                                        </Button>
                                    </div>
                                    
                                    {showDocuments && (
                                        <div className="space-y-2">
                                            {selectedClaimData.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        <span className="text-sm">{doc}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Review Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Review Notes</label>
                                    <Textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add notes about your review decision..."
                                        rows={3}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        onClick={() => handleReview(selectedClaim, 'approved')}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve Claim
                                    </Button>
                                    <Button
                                        onClick={() => handleReview(selectedClaim, 'rejected')}
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject Claim
                                    </Button>
                                    <Button
                                        onClick={() => handleReview(selectedClaim, 'more-info-requested')}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Request More Info
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => checkEligibility(selectedClaim)}
                                    >
                                        Check Eligibility
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedClaim(null)
                                            setReviewNotes('')
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Policy Management</h3>
                        <Button onClick={() => setShowAddPolicy(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Policy
                        </Button>
                    </div>

                    {/* Add Policy Form */}
                    {showAddPolicy && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Policy</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Policy Name</label>
                                        <Input
                                            value={newPolicy.name}
                                            onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                                            placeholder="e.g., Premium Health Coverage"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Coverage Type</label>
                                        <Input
                                            value={newPolicy.coverageType}
                                            onChange={(e) => setNewPolicy({...newPolicy, coverageType: e.target.value})}
                                            placeholder="e.g., Health, Dental, Vision"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Max Coverage ($)</label>
                                        <Input
                                            type="number"
                                            value={newPolicy.maxCoverage}
                                            onChange={(e) => setNewPolicy({...newPolicy, maxCoverage: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Deductible ($)</label>
                                        <Input
                                            type="number"
                                            value={newPolicy.deductible}
                                            onChange={(e) => setNewPolicy({...newPolicy, deductible: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Coverage Percentage (%)</label>
                                        <Input
                                            type="number"
                                            value={newPolicy.coveragePercentage}
                                            onChange={(e) => setNewPolicy({...newPolicy, coveragePercentage: Number(e.target.value)})}
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Eligibility Criteria</label>
                                    {newPolicy.eligibilityCriteria.map((criteria, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={criteria}
                                                onChange={(e) => {
                                                    const updated = [...newPolicy.eligibilityCriteria]
                                                    updated[index] = e.target.value
                                                    setNewPolicy({...newPolicy, eligibilityCriteria: updated})
                                                }}
                                                placeholder="Enter eligibility criteria"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = newPolicy.eligibilityCriteria.filter((_, i) => i !== index)
                                                    setNewPolicy({...newPolicy, eligibilityCriteria: updated})
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setNewPolicy({
                                            ...newPolicy, 
                                            eligibilityCriteria: [...newPolicy.eligibilityCriteria, '']
                                        })}
                                    >
                                        Add Criteria
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleAddPolicy}>Save Policy</Button>
                                    <Button variant="outline" onClick={() => setShowAddPolicy(false)}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Existing Policies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {policies.map(policy => (
                            <Card key={policy.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {policy.name}
                                                <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                                                    {policy.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </CardTitle>
                                            <p className="text-gray-600">{policy.coverageType}</p>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Max Coverage:</span>
                                        <span className="font-medium">${policy.maxCoverage.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Deductible:</span>
                                        <span className="font-medium">${policy.deductible}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Coverage:</span>
                                        <span className="font-medium">{policy.coveragePercentage}%</span>
                                    </div>
                                    <div className="mt-3">
                                        <h5 className="font-medium text-sm mb-2">Eligibility Criteria:</h5>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {policy.eligibilityCriteria.map((criteria, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                    {criteria}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">${totalClaimsValue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Total Claims Value</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-blue-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{approvalRate.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-600">Approval Rate</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">{averageProcessingTime}</p>
                                    <p className="text-sm text-gray-600">Avg Processing Days</p>
                                </div>
                                <Clock className="w-8 h-8 text-purple-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">${fraudPreventionSavings.toFixed(0)}</p>
                                    <p className="text-sm text-gray-600">Fraud Prevention</p>
                                </div>
                                <Shield className="w-8 h-8 text-orange-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Fraud Detection Dashboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Fraud Detection & Risk Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {unresolvedFraudAlerts.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No active fraud alerts.</p>
                                ) : (
                                    unresolvedFraudAlerts.map(alert => {
                                        const claim = claims.find(c => c.id === alert.claimId)
                                        return (
                                            <div key={alert.id} className={`p-4 rounded-lg border ${
                                                alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                                                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                                                'bg-blue-50 border-blue-200'
                                            }`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={
                                                            alert.severity === 'high' ? 'destructive' :
                                                            alert.severity === 'medium' ? 'secondary' : 'default'
                                                        }>
                                                            {alert.severity.toUpperCase()} RISK
                                                        </Badge>
                                                        <span className="font-medium">Claim #{alert.claimId}</span>
                                                        {claim && <span className="text-gray-600">- {claim.patientName}</span>}
                                                    </div>
                                                    <Badge variant="outline">{alert.alertType.replace('-', ' ')}</Badge>
                                                </div>
                                                <p className="text-gray-700 mb-3">{alert.description}</p>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        Investigate
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Mark Resolved
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Claims Statistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Claims by Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Pending</span>
                                        <span className="font-medium">{pendingClaims.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Approved</span>
                                        <span className="font-medium text-green-600">{approvedClaims.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Rejected</span>
                                        <span className="font-medium text-red-600">{rejectedClaims.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Info Requested</span>
                                        <span className="font-medium text-blue-600">{moreInfoRequested.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Low Risk (0-40)</span>
                                        <span className="text-green-600 font-medium">
                                            {claims.filter(c => (c.riskScore || 0) <= 40).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Medium Risk (41-70)</span>
                                        <span className="text-yellow-600 font-medium">
                                            {claims.filter(c => (c.riskScore || 0) > 40 && (c.riskScore || 0) <= 70).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">High Risk (71-100)</span>
                                        <span className="text-red-600 font-medium">
                                            {claims.filter(c => (c.riskScore || 0) > 70).length}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
