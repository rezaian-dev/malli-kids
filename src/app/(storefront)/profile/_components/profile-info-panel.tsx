import { AccountForm } from "./account-form";
import { ChildForm } from "./child-form";

// 👤 Native account forms keep profile settings light and reliable.
export function ProfileInfoPanel() {
  return (
    <>
      <AccountForm />
      <ChildForm />
    </>
  );
}
