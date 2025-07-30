"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, FileText, Send, Plus } from 'lucide-react'

export function DoctorView() {
    const { treatments, users, addTreatment, submitTreatment } = useAppStore()
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        diagnosis: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
    })

    const patients = users.filter(u => u.role === 'patient')
    const doctorTreatments = treatments.filter(t => t.doctorId === '1') // Current doctor

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.patientId || !formData.diagnosis || !formData.cost) return

        const patient = patients.find(p => p.id === formData.patientId)
        if (!patient) return

        addTreatment({
            doctorId: '1',
            doctorName: 'Dr. Sarah Johnson',
            patientId: formData.patientId,
            patientName: patient.name,
            diagnosis: formData.diagnosis,
            cost: parseFloat(formData.cost),
            date: formData.date
        })

        setFormData({
            patientId: '',
            patientName: '',
            diagnosis: '',
            cost: '',
            date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
    }

    const handleSubmitTreatment = (treatmentId: string) => {
        submitTreatment(treatmentId)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h2>
                    <p className="text-gray-600">Manage patient treatments and submit claims</p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Treatment
                </Button>
            </div>

            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Add New Treatment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Patient</label>
                                    <Select
                                        value={formData.patientId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map(patient => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Treatment Date</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Diagnosis</label>
                                    <Textarea
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                        placeholder="Enter diagnosis details..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Treatment Cost ($)</label>
                                    <Input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Save Treatment</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Treatment Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {doctorTreatments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No treatments recorded yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {doctorTreatments.map(treatment => (
                                    <TableRow key={treatment.id}>
                                        <TableCell className="font-medium">{treatment.patientName}</TableCell>
                                        <TableCell>{treatment.diagnosis}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" />
                                            {treatment.date}
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            ${treatment.cost}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={treatment.status === 'submitted' ? 'default' : 'secondary'}>
                                                {treatment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {treatment.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSubmitTreatment(treatment.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Submit
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
