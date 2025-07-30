"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { CalendarDays, DollarSign, FileText, CheckCircle, XCircle, Clock, Eye, Edit, Trash2, Search, Filter, MoreHorizontal } from 'lucide-react'

export function InsuranceView() {
    const { claims, reviewClaim, updateClaim, deleteClaim } = useAppStore()
    const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState('')
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingClaim, setEditingClaim] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [editFormData, setEditFormData] = useState({
        diagnosis: '',
        cost: '',
        insuranceNotes: ''
    })

    const pendingClaims = claims.filter(c => c.status === 'pending')
    const reviewedClaims = claims.filter(c => c.status !== 'pending')

    // Filter claims based on search and status
    const filteredClaims = claims.filter(claim => {
        const matchesSearch =
            claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.id.includes(searchTerm)

        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleReview = (claimId: string, status: 'approved' | 'rejected') => {
        reviewClaim(claimId, status, reviewNotes)
        setShowReviewModal(false)
        setSelectedClaim(null)
        setReviewNotes('')
    }

    const handleViewClaim = (claimId: string) => {
        setSelectedClaim(claimId)
        setShowViewModal(true)
    }

    const handleEditClaim = (claimId: string) => {
        const claim = claims.find(c => c.id === claimId)
        if (!claim) return

        // Only allow editing pending claims
        if (claim.status !== 'pending') {
            alert(`Cannot edit ${claim.status} claims. Only pending claims can be modified.`)
            return
        }

        setEditingClaim(claimId)
        setEditFormData({
            diagnosis: claim.diagnosis,
            cost: claim.cost.toString(),
            insuranceNotes: claim.insuranceNotes || ''
        })
        setShowEditModal(true)
    }

    const handleUpdateClaim = () => {
        if (!editingClaim) return

        updateClaim(editingClaim, {
            diagnosis: editFormData.diagnosis,
            cost: parseFloat(editFormData.cost),
            insuranceNotes: editFormData.insuranceNotes
        })

        setShowEditModal(false)
        setEditingClaim(null)
        setEditFormData({ diagnosis: '', cost: '', insuranceNotes: '' })
    }

    const handleDeleteClaim = (claimId: string) => {
        const claim = claims.find(c => c.id === claimId)
        if (!claim) return

        // Only allow deleting pending claims
        if (claim.status !== 'pending') {
            alert(`Cannot delete ${claim.status} claims. Only pending claims can be removed.`)
            return
        }

        if (confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
            deleteClaim(claimId)
        }
    }

    const handleReviewModal = (claimId: string) => {
        setSelectedClaim(claimId)
        setShowReviewModal(true)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
            default: return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning'
            case 'approved': return 'default'
            case 'rejected': return 'destructive'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Insurance Review Dashboard</h2>
                    <p className="text-gray-600">Review and process insurance claims</p>
                </div>
                <div className="flex gap-4">
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{pendingClaims.length}</p>
                            <p className="text-sm text-gray-600">Pending Reviews</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {reviewedClaims.filter(c => c.status === 'approved').length}
                            </p>
                            <p className="text-sm text-gray-600">Approved</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {reviewedClaims.filter(c => c.status === 'rejected').length}
                            </p>
                            <p className="text-sm text-gray-600">Rejected</p>
                        </div>
                    </Card>
                </div>
            </div>

            {pendingClaims.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            Pending Claims Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Claim ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingClaims.map(claim => (
                                    <TableRow key={claim.id}>
                                        <TableCell className="font-medium">#{claim.id}</TableCell>
                                        <TableCell>{claim.patientName}</TableCell>
                                        <TableCell>{claim.doctorName}</TableCell>
                                        <TableCell>{claim.diagnosis}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            ${claim.cost}
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" />
                                            {claim.submittedDate}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewClaim(claim.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleReviewModal(claim.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Review Claim
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            All Claims History
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {filteredClaims.length} of {claims.length} claims
                            </Badge>
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search claims by patient, doctor, diagnosis, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchTerm || statusFilter !== 'all') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setStatusFilter('all')
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredClaims.length === 0 ? (
                        <div className="text-center py-8">
                            {claims.length === 0 ? (
                                <p className="text-gray-500">No claims to review yet.</p>
                            ) : (
                                <div>
                                    <p className="text-gray-500 mb-2">No claims match your search criteria.</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('')
                                            setStatusFilter('all')
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Claim ID</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Diagnosis</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClaims.map(claim => (
                                        <TableRow key={claim.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">#{claim.id}</TableCell>
                                            <TableCell>{claim.patientName}</TableCell>
                                            <TableCell>{claim.doctorName}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={claim.diagnosis}>
                                                {claim.diagnosis}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium">${claim.cost}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <CalendarDays className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">{claim.submittedDate}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(claim.status)}
                                                    <Badge variant={getStatusColor(claim.status) as "default" | "secondary" | "destructive" | "outline"} className="capitalize">
                                                        {claim.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewClaim(claim.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {claim.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleEditClaim(claim.id)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Claim
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleReviewModal(claim.id)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Review Claim
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteClaim(claim.id)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete Claim
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Claim Modal */}
            {showViewModal && selectedClaim && (() => {
                const claimData = claims.find(c => c.id === selectedClaim)
                if (!claimData) return null

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <Card className="border-0 shadow-none">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-blue-600" />
                                            View Claim #{selectedClaim}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowViewModal(false)
                                                setSelectedClaim(null)
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Patient Information</h4>
                                            <p className="text-gray-600">{claimData.patientName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Doctor</h4>
                                            <p className="text-gray-600">{claimData.doctorName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Diagnosis</h4>
                                            <p className="text-gray-600">{claimData.diagnosis}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Treatment Cost</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${claimData.cost}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Submitted Date</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {claimData.submittedDate}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(claimData.status)}
                                                <Badge variant={getStatusColor(claimData.status) as "default" | "secondary" | "destructive" | "outline"} className="capitalize">
                                                    {claimData.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                                        <div className="space-y-2">
                                            {claimData.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {claimData.insuranceNotes && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Insurance Notes</h4>
                                            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{claimData.insuranceNotes}</p>
                                        </div>
                                    )}

                                    {claimData.reviewedDate && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Reviewed Date</h4>
                                            <p className="text-gray-600">{claimData.reviewedDate}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            })()}

            {/* Review Claim Modal */}
            {showReviewModal && selectedClaim && (() => {
                const claimData = claims.find(c => c.id === selectedClaim)
                if (!claimData) return null

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <Card className="border-0 shadow-none">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            Review Claim #{selectedClaim}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowReviewModal(false)
                                                setSelectedClaim(null)
                                                setReviewNotes('')
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Patient</h4>
                                            <p className="text-gray-600">{claimData.patientName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Doctor</h4>
                                            <p className="text-gray-600">{claimData.doctorName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Diagnosis</h4>
                                            <p className="text-gray-600">{claimData.diagnosis}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Treatment Cost</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${claimData.cost}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {claimData.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Review Notes *</label>
                                        <Textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Add detailed notes about your review decision..."
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            onClick={() => handleReview(selectedClaim, 'approved')}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            disabled={!reviewNotes.trim()}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve Claim
                                        </Button>
                                        <Button
                                            onClick={() => handleReview(selectedClaim, 'rejected')}
                                            variant="destructive"
                                            className="flex items-center gap-2"
                                            disabled={!reviewNotes.trim()}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject Claim
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowReviewModal(false)
                                                setSelectedClaim(null)
                                                setReviewNotes('')
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            })()}

            {/* Edit Claim Modal */}
            {showEditModal && editingClaim && (() => {
                const claimData = claims.find(c => c.id === editingClaim)
                if (!claimData) return null

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <Card className="border-0 shadow-none">
                                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5 text-yellow-600" />
                                            Edit Claim #{editingClaim}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowEditModal(false)
                                                setEditingClaim(null)
                                                setEditFormData({ diagnosis: '', cost: '', insuranceNotes: '' })
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Patient</h4>
                                            <p className="text-gray-600">{claimData.patientName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Doctor</h4>
                                            <p className="text-gray-600">{claimData.doctorName}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Diagnosis *</label>
                                        <Input
                                            value={editFormData.diagnosis}
                                            onChange={(e) => setEditFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            placeholder="Enter diagnosis"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Treatment Cost *</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                type="number"
                                                value={editFormData.cost}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, cost: e.target.value }))}
                                                placeholder="0.00"
                                                className="pl-10"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Insurance Notes</label>
                                        <Textarea
                                            value={editFormData.insuranceNotes}
                                            onChange={(e) => setEditFormData(prev => ({ ...prev, insuranceNotes: e.target.value }))}
                                            placeholder="Add any insurance-related notes..."
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            onClick={handleUpdateClaim}
                                            className="flex items-center gap-2"
                                            disabled={!editFormData.diagnosis.trim() || !editFormData.cost || parseFloat(editFormData.cost) <= 0}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Update Claim
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowEditModal(false)
                                                setEditingClaim(null)
                                                setEditFormData({ diagnosis: '', cost: '', insuranceNotes: '' })
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
