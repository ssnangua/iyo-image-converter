import { ElLoading, ElMessage } from "element-plus";

export function showLoading(options) {
  return ElLoading.service(options);
}

export function showSuccess(message) {
  return ElMessage({ message, type: "success" });
}

export function showError(message, description) {
  return ElMessage({
    duration: 0,
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: description
      ? `<b>${message}</b><div style="margin-top: 20px;">${description}</div>`
      : message,
    type: "error",
  });
}
