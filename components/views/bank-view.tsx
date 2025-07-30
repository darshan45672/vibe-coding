"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { CalendarDays, DollarSign, CreditCard, CheckCircle, Clock, XCircle, MoreHorizontal, Eye } from 'lucide-react'

export function BankView() {
    const { claims, payments, completePayment, rejectPayment } = useAppStore()
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
    const [processingNotes, setProcessingNotes] = useState('')
    const [paymentActions, setPaymentActions] = useState<Record<string, string>>({})
    const [viewingPayment, setViewingPayment] = useState<string | null>(null)

    const pendingPayments = payments.filter(p => p.status === 'pending')
    const completedPayments = payments.filter(p => p.status === 'completed')
    const rejectedPayments = payments.filter(p => p.status === 'rejected')

    const handlePaymentAction = (paymentId: string, action: string) => {
        setPaymentActions(prev => ({ ...prev, [paymentId]: action }))
    }

    const handleProcessPayment = (paymentId: string) => {
        const action = paymentActions[paymentId]
        if (action === 'pay') {
            completePayment(paymentId, processingNotes)
        } else if (action === 'reject') {
            rejectPayment(paymentId, processingNotes)
        }
        setSelectedPayment(null)
        setProcessingNotes('')
        setPaymentActions(prev => {
            const newActions = { ...prev }
            delete newActions[paymentId]
            return newActions
        })
    }

    const getPaymentDetails = (claimId: string) => {
        const claim = claims.find(c => c.id === claimId)
        return claim
    }

    const getTotalPayouts = () => {
        return completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    }

    const getPendingAmount = () => {
        return pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)
    }

    const getAllProcessedPayments = () => {
        return [...completedPayments, ...rejectedPayments]
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Bank Payment Center</h2>
                    <p className="text-gray-600">Process approved insurance claim payments</p>
                </div>
                <div className="flex gap-4">
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</p>
                            <p className="text-sm text-gray-600">Pending Payments</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">${getPendingAmount()}</p>
                            <p className="text-sm text-gray-600">Pending Amount</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">${getTotalPayouts()}</p>
                            <p className="text-sm text-gray-600">Total Payouts</p>
                        </div>
                    </Card>
                </div>
            </div>

            {pendingPayments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            Payments to Process
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment ID</TableHead>
                                    <TableHead>Claim ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Amount</TableHead>
                                    {/* <TableHead>Initiated</TableHead> */}
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingPayments.map(payment => {
                                    const claimDetails = getPaymentDetails(payment.claimId)
                                    const selectedAction = paymentActions[payment.id]
                                    return (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">#{payment.id}</TableCell>
                                            <TableCell>#{payment.claimId}</TableCell>
                                            <TableCell>{claimDetails?.patientName}</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${payment.amount}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {payment.initiatedDate}
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
                                                        <DropdownMenuItem onClick={() => setSelectedPayment(payment.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                handlePaymentAction(payment.id, 'pay')
                                                                setSelectedPayment(payment.id)
                                                            }}
                                                            className="text-green-600 focus:text-green-600"
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Process Payment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                handlePaymentAction(payment.id, 'reject')
                                                                setSelectedPayment(payment.id)
                                                            }}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject Payment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {selectedPayment && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Process Payment #{selectedPayment}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(() => {
                            const payment = payments.find(p => p.id === selectedPayment)
                            const claimDetails = payment ? getPaymentDetails(payment.claimId) : null
                            const selectedAction = paymentActions[selectedPayment]

                            if (!payment || !claimDetails) return null

                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Beneficiary</h4>
                                            <p className="text-gray-600">{claimDetails.patientName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Payment Amount</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${payment.amount}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Claim Details</h4>
                                            <p className="text-gray-600">{claimDetails.diagnosis}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Original Amount</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${claimDetails.cost}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Coverage</h4>
                                            <p className="text-gray-600">
                                                {Math.round((payment.amount / claimDetails.cost) * 100)}% covered
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Payment Initiated</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {payment.initiatedDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Selected Action</h4>
                                        <Badge
                                            variant={selectedAction === 'pay' ? 'default' : 'destructive'}
                                            className="mb-4"
                                        >
                                            {selectedAction === 'pay' ? 'Pay' : 'Reject'} Payment
                                        </Badge>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            {selectedAction === 'pay' ? 'Payment' : 'Rejection'} Notes
                                        </label>
                                        <Textarea
                                            value={processingNotes}
                                            onChange={(e) => setProcessingNotes(e.target.value)}
                                            placeholder={`Add notes about the payment ${selectedAction === 'pay' ? 'processing' : 'rejection'}...`}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleProcessPayment(selectedPayment)}
                                            className="flex items-center gap-2"
                                            variant={selectedAction === 'pay' ? 'default' : 'destructive'}
                                        >
                                            {selectedAction === 'pay' ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Complete Payment
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Reject Payment
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedPayment(null)
                                                setProcessingNotes('')
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )
                        })()}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {getAllProcessedPayments().length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No payments processed yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment ID</TableHead>
                                    <TableHead>Claim ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Initiated</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getAllProcessedPayments().map(payment => {
                                    const claimDetails = getPaymentDetails(payment.claimId)
                                    return (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">#{payment.id}</TableCell>
                                            <TableCell>#{payment.claimId}</TableCell>
                                            <TableCell>{claimDetails?.patientName}</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${payment.amount}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {payment.initiatedDate}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        payment.status === 'completed'
                                                            ? 'default'
                                                            : payment.status === 'rejected'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                    className={
                                                        payment.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : payment.status === 'rejected'
                                                                ? 'bg-red-100 text-red-800'
                                                                : ''
                                                    }
                                                >
                                                    {payment.status === 'completed' ? 'Paid' :
                                                        payment.status === 'rejected' ? 'Rejected' :
                                                            payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payment.completedDate && (
                                                    <span className="flex items-center gap-2">
                                                        <CalendarDays className="w-4 h-4" />
                                                        {payment.completedDate}
                                                    </span>
                                                )}
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
                                                        <DropdownMenuItem onClick={() => setViewingPayment(payment.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View Payment Details Modal */}
            {viewingPayment && (() => {
                const payment = [...pendingPayments, ...getAllProcessedPayments()].find(p => p.id === viewingPayment)
                const claimDetails = payment ? getPaymentDetails(payment.claimId) : null
                
                if (!payment || !claimDetails) return null

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <Card className="border-0 shadow-none">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            Payment Details #{viewingPayment}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewingPayment(null)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Payment ID</h4>
                                            <p className="text-gray-600">#{payment.id}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Claim ID</h4>
                                            <p className="text-gray-600">#{payment.claimId}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Beneficiary</h4>
                                            <p className="text-gray-600">{claimDetails.patientName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Payment Amount</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${payment.amount}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Original Claim Amount</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                ${claimDetails.cost}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Coverage Percentage</h4>
                                            <p className="text-gray-600">
                                                {Math.round((payment.amount / claimDetails.cost) * 100)}%
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Initiated Date</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {payment.initiatedDate}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                                            <Badge
                                                variant={
                                                    payment.status === 'completed'
                                                        ? 'default'
                                                        : payment.status === 'rejected'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                }
                                                className={
                                                    payment.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : payment.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : payment.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : ''
                                                }
                                            >
                                                {payment.status === 'completed' ? 'Paid' :
                                                    payment.status === 'rejected' ? 'Rejected' :
                                                        payment.status === 'pending' ? 'Pending' :
                                                            payment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Claim Details</h4>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Diagnosis:</span> {claimDetails.diagnosis}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-1">
                                                <span className="font-medium">Doctor:</span> {claimDetails.doctorName}
                                            </p>
                                        </div>
                                    </div>

                                    {payment.completedDate && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Completed Date</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {payment.completedDate}
                                            </p>
                                        </div>
                                    )}

                                    {payment.bankNotes && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Bank Notes</h4>
                                            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{payment.bankNotes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
