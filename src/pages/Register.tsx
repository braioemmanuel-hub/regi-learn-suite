import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    surname: "",
    firstName: "",
    lastName: "",
    gender: "",
    maritalStatus: "",
    dateOfBirth: "",
    address: "",
    country: "",
    stateOfOrigin: "",
    lga: "",
    email: "",
    password: "",
    phoneNumber: "",
    religion: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinAddress: "",
    nextOfKinRelationship: "",
    nextOfKinEmail: "",
    proposedCourse: "",
  });

  const [documents, setDocuments] = useState({
    ssceResult: null as File | null,
    birthCertificate: null as File | null,
    stateOfOriginCert: null as File | null,
    passportPhoto: null as File | null,
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    setDocuments({ ...documents, [field]: file });
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('passports')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('passports')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate unique student ID
      const { data: idData, error: idError } = await supabase.rpc('generate_student_id');
      if (idError) throw idError;
      const studentId = idData;

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Upload documents
      const [ssceUrl, birthCertUrl, stateOfOriginUrl, passportUrl] = await Promise.all([
        documents.ssceResult ? uploadFile(documents.ssceResult, 'ssce') : null,
        documents.birthCertificate ? uploadFile(documents.birthCertificate, 'birth') : null,
        documents.stateOfOriginCert ? uploadFile(documents.stateOfOriginCert, 'state') : null,
        documents.passportPhoto ? uploadFile(documents.passportPhoto, 'passports') : null,
      ]);

      // Upload payment proof
      const paymentProofUrl = paymentProof ? await uploadFile(paymentProof, 'payments') : null;

      // Update profile with all details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          surname: formData.surname,
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          gender: formData.gender,
          marital_status: formData.maritalStatus,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          country: formData.country,
          state_of_origin: formData.stateOfOrigin,
          lga: formData.lga,
          phone_number: formData.phoneNumber,
          religion: formData.religion,
          next_of_kin_name: formData.nextOfKinName,
          next_of_kin_phone: formData.nextOfKinPhone,
          next_of_kin_address: formData.nextOfKinAddress,
          next_of_kin_relationship: formData.nextOfKinRelationship,
          next_of_kin_email: formData.nextOfKinEmail,
          proposed_course: formData.proposedCourse,
          student_unique_id: studentId,
          passport_photo: passportUrl,
          registration_approved: false,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Save registration documents
      const { error: docError } = await supabase.from('registration_documents').insert({
        student_id: authData.user.id,
        ssce_result: ssceUrl,
        birth_certificate: birthCertUrl,
        state_of_origin_cert: stateOfOriginUrl,
        passport_photo: passportUrl,
      });

      if (docError) throw docError;

      // Create registration payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        student_id: authData.user.id,
        amount: 10000,
        payment_type: 'Registration Fee',
        status: 'pending',
        payment_proof: paymentProofUrl,
        is_registration_payment: true,
        description: 'Initial registration payment',
      });

      if (paymentError) throw paymentError;

      toast({
        title: "Registration Submitted",
        description: "Redirecting to your registration form...",
      });

      // Redirect to registration form
      setTimeout(() => {
        navigate('/student/registration-form');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Student Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="surname">Surname *</Label>
                    <Input
                      id="surname"
                      required
                      value={formData.surname}
                      onChange={(e) => handleChange('surname', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maritalStatus">Marital Status *</Label>
                    <Select value={formData.maritalStatus} onValueChange={(v) => handleChange('maritalStatus', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => handleChange('religion', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stateOfOrigin">State of Origin *</Label>
                    <Input
                      id="stateOfOrigin"
                      required
                      value={formData.stateOfOrigin}
                      onChange={(e) => handleChange('stateOfOrigin', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lga">L.G.A *</Label>
                    <Input
                      id="lga"
                      required
                      value={formData.lga}
                      onChange={(e) => handleChange('lga', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                  />
                </div>
              </div>

              {/* Next of Kin */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nextOfKinName">Name *</Label>
                    <Input
                      id="nextOfKinName"
                      required
                      value={formData.nextOfKinName}
                      onChange={(e) => handleChange('nextOfKinName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextOfKinPhone">Phone *</Label>
                    <Input
                      id="nextOfKinPhone"
                      type="tel"
                      required
                      value={formData.nextOfKinPhone}
                      onChange={(e) => handleChange('nextOfKinPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nextOfKinEmail">Email *</Label>
                    <Input
                      id="nextOfKinEmail"
                      type="email"
                      required
                      value={formData.nextOfKinEmail}
                      onChange={(e) => handleChange('nextOfKinEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextOfKinRelationship">Relationship *</Label>
                    <Input
                      id="nextOfKinRelationship"
                      required
                      value={formData.nextOfKinRelationship}
                      onChange={(e) => handleChange('nextOfKinRelationship', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nextOfKinAddress">Address *</Label>
                  <Input
                    id="nextOfKinAddress"
                    required
                    value={formData.nextOfKinAddress}
                    onChange={(e) => handleChange('nextOfKinAddress', e.target.value)}
                  />
                </div>
              </div>

              {/* Proposed Course */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Proposed Course of Study</h3>
                <div>
                  <Label htmlFor="proposedCourse">Select Course *</Label>
                  <Select value={formData.proposedCourse} onValueChange={(v) => handleChange('proposedCourse', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ogechione">Ogechione</SelectItem>
                      <SelectItem value="ogechitwo">Ogechitwo</SelectItem>
                      <SelectItem value="ogechithree">Ogechithree</SelectItem>
                      <SelectItem value="ogechifour">Ogechifour</SelectItem>
                      <SelectItem value="ogechifive">Ogechifive</SelectItem>
                      <SelectItem value="ogechisix">Ogechisix</SelectItem>
                      <SelectItem value="ogechiseven">Ogechiseven</SelectItem>
                      <SelectItem value="ogechieight">Ogechieight</SelectItem>
                      <SelectItem value="ogechinine">Ogechinine</SelectItem>
                      <SelectItem value="ogechiten">Ogechiten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Documents Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssceResult">SSCE Result *</Label>
                    <Input
                      id="ssceResult"
                      type="file"
                      required
                      onChange={(e) => handleFileChange('ssceResult', e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthCertificate">Birth Certificate *</Label>
                    <Input
                      id="birthCertificate"
                      type="file"
                      required
                      onChange={(e) => handleFileChange('birthCertificate', e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stateOfOriginCert">State of Origin Certificate *</Label>
                    <Input
                      id="stateOfOriginCert"
                      type="file"
                      required
                      onChange={(e) => handleFileChange('stateOfOriginCert', e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportPhoto">Passport Photograph *</Label>
                    <Input
                      id="passportPhoto"
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => handleFileChange('passportPhoto', e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Registration Payment (₦10,000)</h3>
                <p className="text-sm text-muted-foreground">
                  Please make payment of ₦10,000 and upload proof of payment
                </p>
                <div>
                  <Label htmlFor="paymentProof">Payment Proof *</Label>
                  <Input
                    id="paymentProof"
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Declaration */}
              <div className="space-y-2 border p-4 rounded bg-muted/50">
                <p className="text-sm font-semibold">Declaration</p>
                <p className="text-sm">
                  I hereby declare that all information provided in this form is correct to the best of my knowledge.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
