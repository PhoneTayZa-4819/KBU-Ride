import { X } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export function TermsModal({ open, onClose }: TermsModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#322721] p-6 shadow-2xl max-h-[82vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#EFE7E0] dark:border-[#2C231E]">
          <h2
            id="terms-modal-title"
            className="text-xl font-extrabold text-[#1A120E] dark:text-white"
          >
            KBU Ride Terms & Conditions
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Terms and Conditions"
            className="w-10 h-10 rounded-xl bg-[#FAF7F4] dark:bg-[#241C18] text-[#6B5E57] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 overflow-y-auto pr-1 text-sm leading-relaxed text-[#5C4F48] dark:text-[#BDB3AC]">
          <section>
            <h3 className="font-bold text-[#1A120E] dark:text-white">
              1. Campus Shuttle Service Eligibility
            </h3>
            <p className="mt-1">
              KBU Ride is provided for Kasem Bundit University students, faculty, and staff commuting on the 3-stop Romklao loop between Kasem Bundit Romklao Dormitory, ข้าวซอยเงินล้าน, and Kasem Bundit University Romklao Campus (operating 07:00 – 18:00 Bangkok time). Please carry your student ID card when boarding.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#1A120E] dark:text-white">
              2. Live Estimates & Seat Availability
            </h3>
            <p className="mt-1">
              Arrival times shown in KBU Ride are live estimates calculated from shuttle GPS telemetry and traffic speed. Selecting a shuttle or setting a boarding reminder does not reserve a seat. Boarding is first-come, first-served at designated campus stops.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#1A120E] dark:text-white">
              3. Google Maps Features & Location Privacy
            </h3>
            <p className="mt-1">
              KBU Ride integrates Google Maps features and content. By using this application, you are also bound by the{' '}
              <a
                href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#FF6D24] hover:text-[#FF8D52]"
              >
                Google Maps/Google Earth Additional Terms of Service
              </a>{' '}
              and the{' '}
              <a
                href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#FF6D24] hover:text-[#FF8D52]"
              >
                Google Privacy Policy
              </a>
              . Sharing your device location is optional, requires explicit browser permission, and can be revoked at any time in your browser settings.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFE7E0] dark:border-[#2C231E]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A] font-bold text-sm transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
