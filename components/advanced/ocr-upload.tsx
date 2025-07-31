"use client"

import { useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye } from 'lucide-react'

interface OCRUploadProps {
    treatmentId?: string
    onOCRComplete?: (extractedData: any) => void
}

export function OCRUpload({ treatmentId, onOCRComplete }: OCRUploadProps) {
    const { processOCR } = useAppStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [ocrResults, setOCRResults] = useState<any[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length === 0) return

        setUploadedFiles(prev => [...prev, ...files])
        
        for (const file of files) {
            setIsProcessing(true)
            try {
                const reportId = Date.now().toString()
                await processOCR(file, reportId)
                
                // Mock OCR result for demonstration
                const mockResult = {
                    fileName: file.name,
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
                
                setOCRResults(prev => [...prev, mockResult])
                onOCRComplete?.(mockResult)
            } catch (error) {
                console.error('OCR processing failed:', error)
            } finally {
                setIsProcessing(false)
            }
        }
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        const files = Array.from(event.dataTransfer.files)
        handleFileUpload({ target: { files } } as any)
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        📄 OCR Document Upload
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-6xl mb-4 text-gray-400">📤</div>
                        <h3 className="text-lg font-medium mb-2">Upload Medical Documents</h3>
                        <p className="text-gray-600 mb-4">
                            Drag and drop files here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                            Supports: PDF, JPG, PNG, TIFF (Bills, Prescriptions, Lab Reports)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.tiff"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    {isProcessing && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                            <div className="text-lg animate-spin text-blue-600">⚙️</div>
                            <div>
                                <p className="font-medium text-blue-900">Processing Documents</p>
                                <p className="text-sm text-blue-700">
                                    AI is extracting text and analyzing content...
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {ocrResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-lg">📄</span>
                            OCR Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ocrResults.map((result, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">{result.fileName}</h4>
                                        <Badge 
                                            variant={result.confidence > 0.8 ? 'default' : 'secondary'}
                                            className="flex items-center gap-1"
                                        >
                                            {result.confidence > 0.8 ? 
                                                <span className="text-xs">✅</span> : 
                                                <span className="text-xs">⚠️</span>
                                            }
                                            {Math.round(result.confidence * 100)}% Confidence
                                        </Badge>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="font-medium mb-2">Extracted Fields</h5>
                                            <Table>
                                                <TableBody>
                                                    {Object.entries(result.extractedFields).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-medium py-1">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </TableCell>
                                                            <TableCell className="py-1">
                                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div>
                                            <h5 className="font-medium mb-2">Raw Text</h5>
                                            <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                {result.extractedText}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" variant="outline">
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Original
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <span className="text-sm mr-1">💾</span>
                                            Export Data
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
