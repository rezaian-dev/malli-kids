import { AccountForm } from "./account-form";
import { RecoveryPhoneForm } from "./recovery-phone-form";
import { ChildForm } from "./child-form";

// 👤 Native account forms keep profile settings light and reliable.
export function ProfileInfoPanel() {
  return (
    <>
      <RecoveryPhoneForm />
      <AccountForm />
      <ChildForm />
    </>
  );
}
