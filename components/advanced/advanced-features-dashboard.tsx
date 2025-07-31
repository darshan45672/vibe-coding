"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OCRUpload } from './ocr-upload'
import { FraudDetection } from './fraud-detection'
import { ProviderNetwork } from './provider-network'
import { ClaimSLATracker } from './claim-sla-tracker'
import { AadhaarValidation } from './aadhaar-validation'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, DollarSign, Clock, Eye, Brain, Activity, Building } from 'lucide-react'

export function AdvancedFeaturesDashboard() {
    const [activeTab, setActiveTab] = useState('ocr')

    const features = [
        {
            id: 'ocr',
            title: 'OCR Document Processing',
            description: 'Auto-extract data from bills and prescriptions',
            icon: '🧾',
            component: <OCRUpload />
        },
        {
            id: 'fraud',
            title: 'AI Fraud Detection',
            description: 'Intelligent fraud detection and risk assessment',
            icon: '🤖',
            component: <FraudDetection />
        },
        {
            id: 'providers',
            title: 'Provider Network',
            description: 'Search and manage healthcare provider network',
            icon: '🏥',
            component: <ProviderNetwork />
        },
        {
            id: 'sla',
            title: 'SLA Tracking',
            description: 'Monitor claim processing timelines and escalations',
            icon: '⏳',
            component: <ClaimSLATracker />
        },
        {
            id: 'aadhaar',
            title: 'Aadhaar Validation',
            description: 'KYC verification using Aadhaar authentication',
            icon: '🪪',
            component: <AadhaarValidation />
        }
    ]

    return (
        <div className="space-y-6">
            {/* Advanced Features Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="w-6 h-6" />
                        Advanced Features Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        Explore cutting-edge features that enhance the insurance claims processing experience
                        with AI, automation, and advanced integrations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {features.map((feature) => (
                            <div 
                                key={feature.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                    activeTab === feature.id 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setActiveTab(feature.id)}
                            >
                                <div className="text-2xl mb-2">{feature.icon}</div>
                                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                                <p className="text-xs text-gray-600">{feature.description}</p>
                                {activeTab === feature.id && (
                                    <Badge variant="default" className="mt-2 text-xs">
                                        Active
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Feature Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    {features.map((feature) => (
                        <TabsTrigger key={feature.id} value={feature.id} className="text-xs">
                            {feature.icon} {feature.title.split(' ')[0]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {features.map((feature) => (
                    <TabsContent key={feature.id} value={feature.id}>
                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <div className="text-4xl mb-2">{feature.icon}</div>
                                <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                            {feature.component}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
