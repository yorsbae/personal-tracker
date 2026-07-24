import { useState, useEffect } from "react";
import { useProfile, type ProfileInput } from "./UseProfile";
import { usePinSettings } from "../../hooks/usePinSettings";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  ACTIVITY_LEVELS,
} from "../../utils/bodyCalculations";
import { exportAllData } from "../../utils/exportData";

const initialForm: ProfileInput = {
  nama: "",
  umur: null,
  jenis_kelamin: "Pria",
  tinggi_badan: null,
  berat_badan: null,
  target_berat_badan: null,
  aktivitas_level: "Sedang",
};

export default function ProfilePage() {
  const { profile, loading, saveProfile } = useProfile();
  const { pinEnabled, setupPin, disablePin } = usePinSettings();

  const [form, setForm] = useState<ProfileInput>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinSetup, setShowPinSetup] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        nama: profile.nama,
        umur: profile.umur,
        jenis_kelamin: profile.jenis_kelamin ?? "Pria",
        tinggi_badan: profile.tinggi_badan,
        berat_badan: profile.berat_badan,
        target_berat_badan: profile.target_berat_badan,
        aktivitas_level: profile.aktivitas_level ?? "Sedang",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage("");
    const result = await saveProfile(form);
    setSaveMessage(result.error ? `Gagal: ${result.error}` : "Tersimpan!");
    setIsSaving(false);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const canCalculate =
    form.berat_badan && form.tinggi_badan && form.umur && form.jenis_kelamin;
  const bmi = canCalculate
    ? calculateBMI(form.berat_badan!, form.tinggi_badan!)
    : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmr = canCalculate
    ? calculateBMR(
        form.berat_badan!,
        form.tinggi_badan!,
        form.umur!,
        form.jenis_kelamin!,
      )
    : null;
  const tdee =
    bmr && form.aktivitas_level
      ? calculateTDEE(bmr, form.aktivitas_level)
      : null;

  const handleSetupPin = async () => {
    setPinError("");
    if (pinInput.length < 4) {
      setPinError("PIN minimal 4 digit");
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError("PIN tidak sama");
      return;
    }
    const result = await setupPin(pinInput);
    if (result.error) setPinError(result.error);
    else {
      setShowPinSetup(false);
      setPinInput("");
      setPinConfirm("");
    }
  };

  const handleDisablePin = async () => {
    if (confirm("Matikan App Lock?")) await disablePin();
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError("");
    const result = await exportAllData();
    if (result.error) setExportError(result.error);
    setIsExporting(false);
  };

  if (loading)
    return <p className="text-gray-400 text-sm py-8 text-center">Memuat...</p>;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg text-sm";

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Profile
      </h1>

      {/* Data Diri */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Data Diri
        </h2>

        <input
          type="text"
          placeholder="Nama"
          value={form.nama ?? ""}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className={inputClass}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Umur"
            value={form.umur ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                umur: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputClass}
          />
          <select
            value={form.jenis_kelamin ?? "Pria"}
            onChange={(e) =>
              setForm({ ...form, jenis_kelamin: e.target.value })
            }
            className={inputClass}
          >
            <option value="Pria">Pria</option>
            <option value="Wanita">Wanita</option>
          </select>

          <input
            type="number"
            placeholder="Tinggi badan (cm)"
            value={form.tinggi_badan ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                tinggi_badan: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Berat badan (kg)"
            value={form.berat_badan ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                berat_badan: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Target berat (kg)"
            value={form.target_berat_badan ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                target_berat_badan: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            className={inputClass}
          />
          <select
            value={form.aktivitas_level ?? "Sedang"}
            onChange={(e) =>
              setForm({ ...form, aktivitas_level: e.target.value })
            }
            className={inputClass}
          >
            {ACTIVITY_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-lg text-sm font-medium"
        >
          {isSaving ? "Menyimpan..." : "Simpan Data Diri"}
        </button>
        {saveMessage && (
          <p className="text-xs text-center text-gray-500">{saveMessage}</p>
        )}
      </div>

      {/* BMI/BMR/TDEE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Body Metrics
        </h2>
        {!canCalculate ? (
          <p className="text-sm text-gray-400">
            Lengkapi umur, jenis kelamin, tinggi, dan berat badan untuk melihat
            perhitungan.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">BMI</p>
              <p className={`font-semibold text-lg ${bmiCategory?.color}`}>
                {bmi!.toFixed(1)}
              </p>
              <p className={`text-xs ${bmiCategory?.color}`}>
                {bmiCategory?.label}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">BMR</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {Math.round(bmr!)}
              </p>
              <p className="text-xs text-gray-400">kal/hari</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">TDEE</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {Math.round(tdee!)}
              </p>
              <p className="text-xs text-gray-400">kal/hari</p>
            </div>
          </div>
        )}
      </div>

      {/* App Lock */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          🔒 App Lock (PIN)
        </h2>

        {pinEnabled ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600">Aktif</p>
            <button
              onClick={handleDisablePin}
              className="text-sm text-red-500 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-lg"
            >
              Matikan
            </button>
          </div>
        ) : showPinSetup ? (
          <div className="space-y-2">
            {pinError && <p className="text-xs text-red-500">{pinError}</p>}
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN baru (4-6 digit)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Ulangi PIN"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSetupPin}
                className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2 rounded-lg text-sm"
              >
                Aktifkan
              </button>
              <button
                onClick={() => setShowPinSetup(false)}
                className="px-4 py-2 text-sm text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Tidak aktif</p>
            <button
              onClick={() => setShowPinSetup(true)}
              className="text-sm bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-3 py-1.5 rounded-lg"
            >
              Aktifkan
            </button>
          </div>
        )}
      </div>

      {/* Export Data */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-2">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Export Data
        </h2>
        <p className="text-xs text-gray-400">
          Download semua data kamu sebagai cadangan pribadi (format JSON).
        </p>
        {exportError && <p className="text-xs text-red-500">{exportError}</p>}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isExporting ? "Menyiapkan file..." : "⬇ Export Semua Data"}
        </button>
      </div>
    </div>
  );
}
