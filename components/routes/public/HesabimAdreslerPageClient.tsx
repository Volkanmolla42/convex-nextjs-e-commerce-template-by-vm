"use client";

import { useReducer } from "react";
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

type AddressesUiState = {
  createValues: AddressFormValues;
  editValues: AddressFormValues;
  editingAddressId: Id<"addresses"> | null;
  isCreating: boolean;
  isUpdating: boolean;
  settingDefaultAddressId: Id<"addresses"> | null;
};

type AddressUiAction =
  | { type: "setCreateField"; field: keyof AddressFormValues; value: string | boolean }
  | { type: "setEditField"; field: keyof AddressFormValues; value: string | boolean }
  | { type: "setCreating"; value: boolean }
  | { type: "setUpdating"; value: boolean }
  | { type: "setSettingDefaultAddressId"; value: Id<"addresses"> | null }
  | { type: "setEditingAddress"; addressId: Id<"addresses">; values: AddressFormValues }
  | { type: "clearEditingAddress" }
  | { type: "resetCreateValues" };

const EMPTY_ADDRESS_FORM: AddressFormValues = {
  title: "",
  city: "",
  district: "",
  detail: "",
  postalCode: "",
  isDefault: false,
};

const INITIAL_UI_STATE: AddressesUiState = {
  createValues: EMPTY_ADDRESS_FORM,
  editValues: EMPTY_ADDRESS_FORM,
  editingAddressId: null,
  isCreating: false,
  isUpdating: false,
  settingDefaultAddressId: null,
};

function addressesUiReducer(state: AddressesUiState, action: AddressUiAction): AddressesUiState {
  switch (action.type) {
    case "setCreateField":
      return {
        ...state,
        createValues: { ...state.createValues, [action.field]: action.value },
      };
    case "setEditField":
      return {
        ...state,
        editValues: { ...state.editValues, [action.field]: action.value },
      };
    case "setCreating":
      return {
        ...state,
        isCreating: action.value,
      };
    case "setUpdating":
      return {
        ...state,
        isUpdating: action.value,
      };
    case "setSettingDefaultAddressId":
      return {
        ...state,
        settingDefaultAddressId: action.value,
      };
    case "setEditingAddress":
      return {
        ...state,
        editingAddressId: action.addressId,
        editValues: action.values,
      };
    case "clearEditingAddress":
      return {
        ...state,
        editingAddressId: null,
        editValues: EMPTY_ADDRESS_FORM,
      };
    case "resetCreateValues":
      return {
        ...state,
        createValues: EMPTY_ADDRESS_FORM,
      };
    default:
      return state;
  }
}

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

  const [uiState, dispatch] = useReducer(addressesUiReducer, INITIAL_UI_STATE);
  const editingAddress = addresses.find((address) => address._id === uiState.editingAddressId) ?? null;

  function updateCreateValues(field: keyof AddressFormValues, value: string | boolean) {
    dispatch({ type: "setCreateField", field, value });
  }

  function updateEditValues(field: keyof AddressFormValues, value: string | boolean) {
    dispatch({ type: "setEditField", field, value });
  }

  async function handleCreateAddress() {
    dispatch({ type: "setCreating", value: true });

    try {
      await createAddress(uiState.createValues);
      toast.success("Adres eklendi");
      dispatch({ type: "resetCreateValues" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Adres eklenemedi");
      }
    } finally {
      dispatch({ type: "setCreating", value: false });
    }
  }

  async function handleUpdateAddress() {
    if (!uiState.editingAddressId) {
      return;
    }

    dispatch({ type: "setUpdating", value: true });

    try {
      await updateAddress({
        addressId: uiState.editingAddressId,
        ...uiState.editValues,
      });
      toast.success("Adres guncellendi");
      dispatch({ type: "clearEditingAddress" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Adres guncellenemedi");
      }
    } finally {
      dispatch({ type: "setUpdating", value: false });
    }
  }

  async function handleSetDefaultAddress(addressId: Id<"addresses">) {
    dispatch({ type: "setSettingDefaultAddressId", value: addressId });

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
      dispatch({ type: "setSettingDefaultAddressId", value: null });
    }
  }

  return (
    <section className="space-y-4">
      <h2>Adresler</h2>

      <div className="space-y-3 border border-border p-4">
        <h3>Yeni Adres</h3>
        <AddressForm
          idPrefix="yeni"
          values={uiState.createValues}
          onChange={updateCreateValues}
          onSubmit={handleCreateAddress}
          submitLabel="Adres Ekle"
          isSubmitting={uiState.isCreating}
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
            const isSettingDefault = uiState.settingDefaultAddressId === address._id;

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
                          dispatch({ type: "clearEditingAddress" });
                          return;
                        }

                        dispatch({
                          type: "setEditingAddress",
                          addressId: address._id,
                          values: getAddressFormValues(address),
                        });
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
                    values={uiState.editValues}
                    onChange={updateEditValues}
                    onSubmit={handleUpdateAddress}
                    submitLabel="Kaydet"
                    isSubmitting={uiState.isUpdating}
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
