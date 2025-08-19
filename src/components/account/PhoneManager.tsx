
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Edit2, Save, X } from 'lucide-react';

interface Profile {
  phone_number?: string;
  additional_phone_number?: string;
}

export const PhoneManager = () => {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [additionalPhone, setAdditionalPhone] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number, additional_phone_number')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setAdditionalPhone(data.additional_phone_number || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+256' + cleaned.slice(1);
    }
    
    if (!cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+256' + cleaned;
    }
    
    if (cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return phone;
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const formattedPhone = additionalPhone ? formatPhoneNumber(additionalPhone) : null;

      const { error } = await supabase
        .from('profiles')
        .update({ additional_phone_number: formattedPhone })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, additional_phone_number: formattedPhone || undefined }));
      setEditing(false);

      toast({
        title: "Success",
        description: "Additional phone number updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update phone number",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setAdditionalPhone(profile.additional_phone_number || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5" />
          <span>Phone Numbers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Phone Number */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Primary Phone</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">
              {profile.phone_number || 'Not set'}
            </p>
            <p className="text-xs text-gray-500">
              This is your main phone number used for account verification
            </p>
          </div>
        </div>

        {/* Additional Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-gray-700">
              Emergency Contact Number
            </Label>
            {!editing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <Input
                type="tel"
                placeholder="+256789123456 or 0789123456"
                value={additionalPhone}
                onChange={(e) => setAdditionalPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This number can be used as an emergency contact for deliveries
              </p>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">
                {profile.additional_phone_number || 'Not set'}
              </p>
              <p className="text-xs text-gray-500">
                Emergency contact number for delivery calls
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
