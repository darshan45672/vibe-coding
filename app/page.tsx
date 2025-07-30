"use client"

import { useAppStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DoctorView } from '@/components/views/doctor-view'
import { PatientView } from '@/components/views/patient-view'
import { InsuranceView } from '@/components/views/insurance-view'
import { BankView } from '@/components/views/bank-view'
import { Stethoscope, User, Building2, Landmark } from 'lucide-react'

export default function Home() {
  const { currentRole, setCurrentRole } = useAppStore()

  const roleIcons = {
    doctor: <Stethoscope className="w-4 h-4" />,
    patient: <User className="w-4 h-4" />,
    insurance: <Building2 className="w-4 h-4" />,
    bank: <Landmark className="w-4 h-4" />
  }

  const roleEmojis = {
    doctor: '👨‍⚕️',
    patient: '🧍',
    insurance: '🏢',
    bank: '🏦'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Insurance Claims Processing System
          </h1>
          <p className="text-lg text-gray-600">
            Simulating the complete flow from treatment to payout
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Current Role:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {roleEmojis[currentRole]} {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="doctor" className="flex items-center gap-2">
              {roleIcons.doctor}
              👨‍⚕️ Doctor
            </TabsTrigger>
            <TabsTrigger value="patient" className="flex items-center gap-2">
              {roleIcons.patient}
              🧍 Patient
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center gap-2">
              {roleIcons.insurance}
              🏢 Insurance
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              {roleIcons.bank}
              🏦 Bank
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctor">
            <DoctorView />
          </TabsContent>

          <TabsContent value="patient">
            <PatientView />
          </TabsContent>

          <TabsContent value="insurance">
            <InsuranceView />
          </TabsContent>

          <TabsContent value="bank">
            <BankView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
