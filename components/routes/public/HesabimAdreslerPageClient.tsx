"use client";

import { useMemo, useState } from "react";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type HesabimAdreslerPageClientProps = {
  preloadedAddresses: Preloaded<typeof api.addresses.listMine>;
};

type AddressFormValues = {
  title: string;
  city: string;
  district: string;
  detail: string;
  postalCode: string;
  isDefault: boolean;
};

const EMPTY_ADDRESS_FORM: AddressFormValues = {
  title: "",
  city: "",
  district: "",
  detail: "",
  postalCode: "",
  isDefault: false,
};

function getAddressFormValues(address: {
  title: string;
  city: string;
  district: string;
  detail: string;
  postalCode: string;
  isDefault: boolean;
}): AddressFormValues {
  return {
    title: address.title,
    city: address.city,
    district: address.district,
    detail: address.detail,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

type AddressFormProps = {
  idPrefix: string;
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string | boolean) => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
};

function AddressForm({
  idPrefix,
  values,
  onChange,
  onSubmit,
  submitLabel,
  isSubmitting,
}: AddressFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-adres-baslik`}>Adres Basligi</Label>
          <Input
            id={`${idPrefix}-adres-baslik`}
            value={values.title}
            onChange={(event) => onChange("title", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-adres-posta-kodu`}>Posta Kodu</Label>
          <Input
            id={`${idPrefix}-adres-posta-kodu`}
            value={values.postalCode}
            onChange={(event) => onChange("postalCode", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-adres-sehir`}>Sehir</Label>
          <Input
            id={`${idPrefix}-adres-sehir`}
            value={values.city}
            onChange={(event) => onChange("city", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-adres-ilce`}>Ilce</Label>
          <Input
            id={`${idPrefix}-adres-ilce`}
            value={values.district}
            onChange={(event) => onChange("district", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-adres-detay`}>Adres Detayi</Label>
        <Textarea
          id={`${idPrefix}-adres-detay`}
          value={values.detail}
          onChange={(event) => onChange("detail", event.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${idPrefix}-adres-varsayilan`}
          checked={values.isDefault}
          onCheckedChange={(checked) => onChange("isDefault", checked === true)}
        />
        <Label htmlFor={`${idPrefix}-adres-varsayilan`}>Varsayilan adres yap</Label>
      </div>

      <Button type="button" onClick={() => void onSubmit()} disabled={isSubmitting}>
        {isSubmitting ? "Isleniyor" : submitLabel}
      </Button>
    </div>
  );
}

export default function HesabimAdreslerPageClient({
  preloadedAddresses,
}: HesabimAdreslerPageClientProps) {
  const addresses = usePreloadedQuery(preloadedAddresses);
  const createAddress = useMutation(api.addresses.create);
  const updateAddress = useMutation(api.addresses.update);
  const setDefaultAddress = useMutation(api.addresses.setDefault);

  const [createValues, setCreateValues] = useState<AddressFormValues>(EMPTY_ADDRESS_FORM);
  const [editValues, setEditValues] = useState<AddressFormValues>(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState<Id<"addresses"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settingDefaultAddressId, setSettingDefaultAddressId] =
    useState<Id<"addresses"> | null>(null);

  const editingAddress = useMemo(
    () => addresses.find((address) => address._id === editingAddressId) ?? null,
    [addresses, editingAddressId],
  );

  function updateCreateValues(field: keyof AddressFormValues, value: string | boolean) {
    setCreateValues((prev) => ({ ...prev, [field]: value }));
  }

  function updateEditValues(field: keyof AddressFormValues, value: string | boolean) {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateAddress() {
    setIsCreating(true);

    try {
      await createAddress(createValues);
      toast.success("Adres eklendi");
      setCreateValues(EMPTY_ADDRESS_FORM);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Adres eklenemedi");
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateAddress() {
    if (!editingAddressId) {
      return;
    }

    setIsUpdating(true);

    try {
      await updateAddress({
        addressId: editingAddressId,
        ...editValues,
      });
      toast.success("Adres guncellendi");
      setEditingAddressId(null);
      setEditValues(EMPTY_ADDRESS_FORM);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Adres guncellenemedi");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSetDefaultAddress(addressId: Id<"addresses">) {
    setSettingDefaultAddressId(addressId);

    try {
      await setDefaultAddress({ addressId });
      toast.success("Varsayilan adres secildi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Varsayilan adres secilemedi");
      }
    } finally {
      setSettingDefaultAddressId(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2>Adresler</h2>

      <div className="space-y-3 border border-border p-4">
        <h3>Yeni Adres</h3>
        <AddressForm
          idPrefix="yeni"
          values={createValues}
          onChange={updateCreateValues}
          onSubmit={handleCreateAddress}
          submitLabel="Adres Ekle"
          isSubmitting={isCreating}
        />
      </div>

      {addresses.length === 0 ? (
        <div className="border border-border p-4">
          <p>Kayitli adres yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const isEditing = editingAddress?._id === address._id;
            const isSettingDefault = settingDefaultAddressId === address._id;

            return (
              <article key={address._id} className="space-y-3 border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3>{address.title}</h3>
                    {address.isDefault ? (
                      <span className="text-sm text-denim">Varsayilan</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.isDefault ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleSetDefaultAddress(address._id)}
                        disabled={isSettingDefault}
                      >
                        {isSettingDefault ? "Isleniyor" : "Varsayilan Yap"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outlineGold"
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          setEditingAddressId(null);
                          setEditValues(EMPTY_ADDRESS_FORM);
                          return;
                        }

                        setEditingAddressId(address._id);
                        setEditValues(getAddressFormValues(address));
                      }}
                    >
                      {isEditing ? "Iptal" : "Duzenle"}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {address.detail}, {address.district}, {address.city} {address.postalCode}
                </p>

                {isEditing ? (
                  <AddressForm
                    idPrefix={`duzenle-${address._id}`}
                    values={editValues}
                    onChange={updateEditValues}
                    onSubmit={handleUpdateAddress}
                    submitLabel="Kaydet"
                    isSubmitting={isUpdating}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
