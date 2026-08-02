import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  addUserAddress,
  deleteUserAddress,
  getUserProfile,
  updateUserProfile,
} from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Address Book | DesignerSale" },
      {
        name: "description",
        content: "Manage your personal details, contact preferences and delivery address book.",
      },
      { property: "og:title", content: "My Profile & Address Book | DesignerSale" },
      { property: "og:description", content: "Manage your DesignerSale account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const getProfileFn = useServerFn(getUserProfile);
  const updateProfileFn = useServerFn(updateUserProfile);
  const addAddressFn = useServerFn(addUserAddress);
  const deleteAddressFn = useServerFn(deleteUserAddress);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isPending, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => getProfileFn({}),
  });

  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");
  const [showAddAddress, setShowAddAddress] = useState(false);

  const updateProfileMut = useMutation({
    mutationFn: (vars: any) => updateProfileFn({ data: vars }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update profile"),
  });

  const addAddressMut = useMutation({
    mutationFn: (vars: any) => addAddressFn({ data: vars }),
    onSuccess: () => {
      toast.success("Address added");
      setShowAddAddress(false);
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to add address"),
  });

  const deleteAddressMut = useMutation({
    mutationFn: (id: string) => deleteAddressFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Address removed");
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete address"),
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const profile = data?.profile;
  const addresses = data?.addresses ?? [];

  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[75vh] max-w-[1200px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="rule-label text-muted-foreground">Account Concierge</p>
            <h1 className="display mt-2 text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.02]">
              Profile Settings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="border border-border px-5 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] hover:bg-cream transition-colors"
            >
              My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="bg-burgundy text-ivory px-5 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="mt-8 flex gap-6 border-b border-border text-xs uppercase tracking-[0.2em]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 font-semibold transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 font-semibold transition-colors cursor-pointer ${
              activeTab === "addresses"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Address Book ({addresses.length})
          </button>
        </div>

        {isPending && <p className="mt-12 text-sm text-muted-foreground">Loading settings…</p>}
        {error && <p className="mt-12 text-sm text-destructive">Could not load profile details.</p>}

        {data && activeTab === "profile" && (
          <div className="mt-10 max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                updateProfileMut.mutate({
                  first_name: String(f.get("first_name") ?? ""),
                  last_name: String(f.get("last_name") ?? ""),
                  display_name: String(f.get("display_name") ?? ""),
                  phone: String(f.get("phone") ?? ""),
                });
              }}
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="First Name"
                  name="first_name"
                  defaultValue={profile?.first_name ?? ""}
                />
                <Field label="Last Name" name="last_name" defaultValue={profile?.last_name ?? ""} />
              </div>
              <Field
                label="Display Name / Atelier Alias"
                name="display_name"
                defaultValue={profile?.display_name ?? ""}
              />
              <Field
                label="Phone Number"
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="+61 400 000 000"
              />
              <div>
                <label className="block text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email ?? ""}
                  className="w-full border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                />
                <span className="mt-1.5 block text-[0.68rem] text-muted-foreground">
                  Email address is managed via authentication security settings.
                </span>
              </div>

              <button
                type="submit"
                disabled={updateProfileMut.isPending}
                className="mt-6 bg-olive-deep px-8 py-3.5 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-ivory hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {updateProfileMut.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {data && activeTab === "addresses" && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="display text-xl">Saved Shipping Locations</h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="border border-border px-5 py-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] hover:bg-cream transition-colors cursor-pointer"
              >
                {showAddAddress ? "Cancel" : "+ Add New Address"}
              </button>
            </div>

            {showAddAddress && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  addAddressMut.mutate({
                    label: String(f.get("label") ?? "Home"),
                    full_name: String(f.get("full_name") ?? ""),
                    phone: String(f.get("phone") ?? ""),
                    address_line_1: String(f.get("address_line_1") ?? ""),
                    address_line_2: String(f.get("address_line_2") ?? ""),
                    city: String(f.get("city") ?? ""),
                    state: String(f.get("state") ?? ""),
                    postal_code: String(f.get("postal_code") ?? ""),
                    country: String(f.get("country") ?? "Australia"),
                    is_default: f.get("is_default") === "on",
                  });
                }}
                className="mb-10 max-w-xl border border-border bg-card p-6 md:p-8 space-y-5"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  New Address
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Label (e.g. Home, Office)" name="label" defaultValue="Home" />
                  <Field label="Recipient Full Name" name="full_name" required />
                </div>
                <Field label="Street Address Line 1" name="address_line_1" required />
                <Field label="Apartment, Suite, Unit (Optional)" name="address_line_2" />
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="City / Suburb" name="city" required />
                  <Field label="State / Region" name="state" />
                  <Field label="Postcode" name="postal_code" required />
                </div>
                <Field label="Country" name="country" defaultValue="Australia" required />
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" name="is_default" className="accent-olive-deep" />
                  Set as default shipping address
                </label>
                <button
                  type="submit"
                  disabled={addAddressMut.isPending}
                  className="bg-olive-deep px-8 py-3 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-ivory hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {addAddressMut.isPending ? "Saving..." : "Save Address"}
                </button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {addresses.map((addr: any) => (
                  <div
                    key={addr.id}
                    className="border border-border bg-card p-6 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[0.62rem] font-bold uppercase tracking-widest text-gold">
                          {addr.label || "Address"} {addr.is_default && "• Default"}
                        </span>
                      </div>
                      <p className="font-serif text-base font-medium">{addr.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{addr.address_line_1}</p>
                      {addr.address_line_2 && (
                        <p className="text-xs text-muted-foreground">{addr.address_line_2}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                      <p className="text-xs text-muted-foreground">{addr.country}</p>
                      {addr.phone && (
                        <p className="text-xs text-muted-foreground mt-2">Ph: {addr.phone}</p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
                      <button
                        onClick={() => deleteAddressMut.mutate(addr.id)}
                        disabled={deleteAddressMut.isPending}
                        className="text-xs text-destructive hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors font-serif"
      />
    </div>
  );
}
