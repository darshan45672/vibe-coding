"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, DollarSign, Eye, Building } from 'lucide-react'

export function ProviderNetwork() {
    const { providerNetwork, searchProviders } = useAppStore()
    const [searchFilters, setSearchFilters] = useState({
        city: '',
        specialty: '',
        type: 'all'
    })
    const [filteredProviders, setFilteredProviders] = useState(providerNetwork)
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

    const handleSearch = () => {
        const searchParams = {
            ...searchFilters,
            type: searchFilters.type === 'all' ? '' : searchFilters.type
        }
        const results = searchProviders(searchParams)
        setFilteredProviders(results)
    }

    const clearFilters = () => {
        setSearchFilters({ city: '', specialty: '', type: 'all' })
        setFilteredProviders(providerNetwork)
    }

    const getNetworkTierColor = (tier: string) => {
        switch (tier) {
            case 'tier1': return 'bg-green-100 text-green-800'
            case 'tier2': return 'bg-yellow-100 text-yellow-800'
            case 'tier3': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'hospital': return '🏥'
            case 'clinic': return '🏢'
            case 'diagnostic_center': return '🔬'
            case 'pharmacy': return '💊'
            default: return '🏢'
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span 
                key={i} 
                className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
                ⭐
            </span>
        ))
    }

    return (
        <div className="space-y-6">
            {/* Network Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Provider Network Directory
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{providerNetwork.length}</div>
                            <div className="text-sm text-gray-600">Total Providers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {providerNetwork.filter(p => p.type === 'hospital').length}
                            </div>
                            <div className="text-sm text-gray-600">Hospitals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {providerNetwork.filter(p => p.type === 'clinic').length}
                            </div>
                            <div className="text-sm text-gray-600">Clinics</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {providerNetwork.filter(p => p.isApproved).length}
                            </div>
                            <div className="text-sm text-gray-600">Approved</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Providers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Search by city..."
                            value={searchFilters.city}
                            onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                        />
                        <Input
                            placeholder="Search by specialty..."
                            value={searchFilters.specialty}
                            onChange={(e) => setSearchFilters(prev => ({ ...prev, specialty: e.target.value }))}
                        />
                        <Select 
                            value={searchFilters.type} 
                            onValueChange={(value) => setSearchFilters(prev => ({ ...prev, type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Provider type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="hospital">Hospital</SelectItem>
                                <SelectItem value="clinic">Clinic</SelectItem>
                                <SelectItem value="diagnostic_center">Diagnostic Center</SelectItem>
                                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button onClick={handleSearch} className="flex-1">
                                Search
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Provider List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Provider Directory ({filteredProviders.length} providers)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Provider</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Specialties</TableHead>
                                <TableHead>Network Tier</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Cashless Limit</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProviders.map(provider => (
                                <TableRow key={provider.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{provider.name}</div>
                                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                                📞 {provider.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            {getTypeIcon(provider.type)}
                                            {provider.type.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            📍
                                            <div>
                                                <div className="text-sm">{provider.city}, {provider.state}</div>
                                                <div className="text-xs text-gray-500">{provider.pincode}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-32">
                                            {provider.specialties.slice(0, 2).map(specialty => (
                                                <Badge key={specialty} variant="secondary" className="text-xs mr-1 mb-1">
                                                    {specialty}
                                                </Badge>
                                            ))}
                                            {provider.specialties.length > 2 && (
                                                <span className="text-xs text-gray-500">
                                                    +{provider.specialties.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getNetworkTierColor(provider.networkTier)}>
                                            {provider.networkTier.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {renderStars(Math.floor(provider.rating))}
                                            <span className="text-sm ml-1">{provider.rating}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            ₹{provider.cashlessLimit.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setSelectedProvider(provider.id)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Provider Details Modal */}
            {selectedProvider && (
                <Card>
                    <CardHeader>
                        <CardTitle>Provider Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const provider = providerNetwork.find(p => p.id === selectedProvider)
                            if (!provider) return null

                            return (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-3">Basic Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Name:</strong> {provider.name}</div>
                                                <div><strong>Type:</strong> {getTypeIcon(provider.type)} {provider.type.replace('_', ' ')}</div>
                                                <div><strong>Phone:</strong> {provider.phone}</div>
                                                <div><strong>Email:</strong> {provider.email}</div>
                                                <div><strong>Rating:</strong> 
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {renderStars(Math.floor(provider.rating))}
                                                        <span>{provider.rating}/5</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-3">Network Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Network Tier:</strong> 
                                                    <Badge className={`ml-2 ${getNetworkTierColor(provider.networkTier)}`}>
                                                        {provider.networkTier.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div><strong>Cashless Limit:</strong> ₹{provider.cashlessLimit.toLocaleString()}</div>
                                                <div><strong>Empanelment Date:</strong> {provider.empanelmentDate}</div>
                                                <div><strong>Status:</strong> 
                                                    <Badge variant={provider.isApproved ? 'default' : 'destructive'} className="ml-2">
                                                        {provider.isApproved ? 'Approved' : 'Pending'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Address</h4>
                                        <p className="text-sm text-gray-600">
                                            {provider.address}<br />
                                            {provider.city}, {provider.state} - {provider.pincode}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Specialties</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {provider.specialties.map(specialty => (
                                                <Badge key={specialty} variant="secondary">
                                                    {specialty}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button size="sm">
                                            Contact Provider
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            View Claims History
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setSelectedProvider(null)}
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
