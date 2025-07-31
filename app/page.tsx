"use client"

import { useAppStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DoctorView } from '@/components/views/doctor-view'
import { PatientView } from '@/components/views/patient-view'
import { InsuranceView } from '@/components/views/insurance-view'
import { BankView } from '@/components/views/bank-view'
import { AdvancedFeaturesDashboard } from '@/components/advanced/advanced-features-dashboard'

export default function Home() {
  const { currentRole, setCurrentRole, currentUser, setCurrentUser, users } = useAppStore()

  const roleIcons = {
    doctor: '👨‍⚕️',
    patient: '🧍',
    insurance: '🏢',
    bank: '🏦',
    advanced: '🚀'
  }

  const roleEmojis = {
    doctor: '👨‍⚕️',
    patient: '🧍',
    insurance: '🏢',
    bank: '🏦',
    advanced: '🚀'
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Current Role:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {roleEmojis[currentRole]} {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Switch User:</span>
                <Select
                  value={currentUser?.id || ''}
                  onValueChange={(userId) => {
                    const user = users.find(u => u.id === userId)
                    if (user) {
                      setCurrentUser(user)
                      setCurrentRole(user.role)
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {roleEmojis[user.role]} {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as "doctor" | "patient" | "insurance" | "bank" | "advanced")}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="doctor" className="flex items-center gap-2">
              {roleIcons.doctor} Doctor
            </TabsTrigger>
            <TabsTrigger value="patient" className="flex items-center gap-2">
              {roleIcons.patient} Patient
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center gap-2">
              {roleIcons.insurance} Insurance
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              {roleIcons.bank} Bank
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              {roleIcons.advanced} Advanced
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

          <TabsContent value="advanced">
            <AdvancedFeaturesDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
