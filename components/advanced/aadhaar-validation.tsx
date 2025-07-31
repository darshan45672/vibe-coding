"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, Clock, Eye, Brain, Activity } from 'lucide-react'

export function AadhaarValidation() {
    const { aadhaarValidations, validateAadhaar } = useAppStore()
    const [aadhaarNumber, setAadhaarNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [selectedValidation, setSelectedValidation] = useState<string | null>(null)

    const handleValidateAadhaar = async () => {
        if (!aadhaarNumber) return

        setIsValidating(true)
        try {
            await validateAadhaar(aadhaarNumber)
            setShowOtpInput(true)
        } catch (error) {
            console.error('ID validation failed:', error)
        } finally {
            setIsValidating(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp) return

        setIsValidating(true)
        try {
            await validateAadhaar(aadhaarNumber, otp)
            setShowOtpInput(false)
            setAadhaarNumber('')
            setOtp('')
        } catch (error) {
            console.error('OTP verification failed:', error)
        } finally {
            setIsValidating(false)
        }
    }

    const formatAadhaarNumber = (number: string) => {
        return number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'failed': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const validationStats = {
        total: aadhaarValidations.length,
        verified: aadhaarValidations.filter(v => v.validationStatus === 'verified').length,
        pending: aadhaarValidations.filter(v => v.validationStatus === 'pending').length,
        failed: aadhaarValidations.filter(v => v.validationStatus === 'failed').length
    }

    return (
        <div className="space-y-6">
            {/* Validation Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🪪 ID Validation System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{validationStats.total}</div>
                            <div className="text-sm text-gray-600">Total Validations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{validationStats.verified}</div>
                            <div className="text-sm text-gray-600">Verified</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{validationStats.pending}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{validationStats.failed}</div>
                            <div className="text-sm text-gray-600">Failed</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Validation Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Verify Your ID</CardTitle>
                </CardHeader>
                <CardContent>
                    {!showOtpInput ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h4 className="font-medium text-blue-900 mb-2">🛡️ Secure ID Verification</h4>
                                <p className="text-sm text-blue-700">
                                    Enter your Aadhaar number to verify your identity. We'll send an OTP to your registered mobile number for verification.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Aadhaar Number / Government ID
                                </label>
                                <Input
                                    placeholder="Enter 12-digit Aadhaar number"
                                    value={aadhaarNumber}
                                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                    maxLength={12}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: {aadhaarNumber ? formatAadhaarNumber(aadhaarNumber.padEnd(12, 'X')) : '1234-5678-9012'}
                                </p>
                            </div>
                            <Button 
                                onClick={handleValidateAadhaar}
                                disabled={aadhaarNumber.length !== 12 || isValidating}
                                className="w-full"
                            >
                                {isValidating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send OTP for Verification'
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-900 mb-2">📱 OTP Sent Successfully</h4>
                                <p className="text-sm text-green-700">
                                    An OTP has been sent to the mobile number registered with ID number 
                                    <strong> {formatAadhaarNumber(aadhaarNumber)}</strong>
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                    Please check your SMS and enter the 6-digit OTP below.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Enter 6-Digit OTP
                                </label>
                                <Input
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleVerifyOTP}
                                    disabled={otp.length !== 6 || isValidating}
                                    className="flex-1"
                                >
                                    {isValidating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowOtpInput(false)
                                        setOtp('')
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Validation History */}
            <Card>
                <CardHeader>
                    <CardTitle>Validation History</CardTitle>
                </CardHeader>
                <CardContent>
                    {aadhaarValidations.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">🆔</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No ID Validations Yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Start by verifying your government ID above. Your validation history will appear here.
                            </p>
                            <div className="text-sm text-gray-500">
                                <p>✅ Secure OTP-based verification</p>
                                <p>🔒 Government-approved authentication</p>
                                <p>⚡ Instant verification results</p>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Validation ID</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>ID Number</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Validation Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aadhaarValidations.map(validation => (
                                    <TableRow key={validation.id}>
                                        <TableCell className="font-medium">{validation.id}</TableCell>
                                        <TableCell>{validation.userId}</TableCell>
                                        <TableCell>
                                            <span className="font-mono">
                                                {formatAadhaarNumber(validation.aadhaarNumber)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{validation.name}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(validation.validationStatus)}>
                                                {validation.validationStatus === 'verified' && '✅'}
                                                {validation.validationStatus === 'pending' && '⏳'}
                                                {validation.validationStatus === 'failed' && '❌'}
                                                {validation.validationStatus.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {validation.validationDate || 'Pending'}
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => setSelectedValidation(validation.id)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Validation Details Modal */}
            {selectedValidation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Validation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const validation = aadhaarValidations.find(v => v.id === selectedValidation)
                            if (!validation) return null

                            return (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-3">Personal Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Name:</strong> {validation.name}</div>
                                                <div><strong>Date of Birth:</strong> {validation.dateOfBirth}</div>
                                                <div><strong>Gender:</strong> {validation.gender === 'M' ? 'Male' : validation.gender === 'F' ? 'Female' : 'Other'}</div>
                                                <div><strong>Aadhaar Number:</strong> 
                                                    <span className="font-mono ml-2">
                                                        {formatAadhaarNumber(validation.aadhaarNumber)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-3">Validation Status</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Status:</strong> 
                                                    <Badge className={`ml-2 ${getStatusColor(validation.validationStatus)}`}>
                                                        {validation.validationStatus.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div><strong>User ID:</strong> {validation.userId}</div>
                                                <div><strong>Validation Date:</strong> {validation.validationDate || 'Pending'}</div>
                                                {validation.otp && (
                                                    <div><strong>OTP Used:</strong> {validation.otp}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Address</h4>
                                        <p className="text-sm text-gray-600">
                                            {validation.address}
                                        </p>
                                    </div>

                                    {validation.validationStatus === 'verified' && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="font-medium text-green-900 mb-2">✅ Verification Complete</h4>
                                            <p className="text-sm text-green-700">
                                                This Aadhaar number has been successfully verified and can be used for KYC purposes.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <Button size="sm">
                                            Download Certificate
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Export Data
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setSelectedValidation(null)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
