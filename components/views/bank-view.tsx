"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, CreditCard, CheckCircle, Clock, Send } from 'lucide-react'

export function BankView() {
    const { claims, payments, completePayment } = useAppStore()
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
    const [processingNotes, setProcessingNotes] = useState('')

    const approvedClaims = claims.filter(c => c.status === 'approved')
    const pendingPayments = payments.filter(p => p.status === 'initiated')
    const completedPayments = payments.filter(p => p.status === 'completed')

    const handleCompletePayment = (paymentId: string) => {
        completePayment(paymentId, processingNotes)
        setSelectedPayment(null)
        setProcessingNotes('')
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
                                    <TableHead>Initiated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingPayments.map(payment => {
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
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedPayment(payment.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Process
                                                </Button>
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
                                        <label className="block text-sm font-medium mb-2">Processing Notes</label>
                                        <Textarea
                                            value={processingNotes}
                                            onChange={(e) => setProcessingNotes(e.target.value)}
                                            placeholder="Add notes about the payment processing..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleCompletePayment(selectedPayment)}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Complete Payment
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
                    {payments.length === 0 ? (
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
                                    <TableHead>Completed</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map(payment => {
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
                                                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                                    {payment.status}
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
                                                {payment.bankNotes && (
                                                    <p className="text-sm text-gray-600">{payment.bankNotes}</p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
