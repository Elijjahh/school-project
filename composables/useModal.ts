interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface AlertOptions {
  title?: string;
  message: string;
  okText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ConfirmState extends ConfirmOptions {
  show: boolean;
  loading: boolean;
  resolve?: (value: boolean) => void;
}

interface AlertState extends AlertOptions {
  show: boolean;
  loading: boolean;
  resolve?: () => void;
}

// Глобальные состояния для модальных окон
const globalConfirmState = ref<ConfirmState>({
  show: false,
  loading: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
});

const globalAlertState = ref<AlertState>({
  show: false,
  loading: false,
  title: '',
  message: '',
  okText: '',
  type: 'info',
});

export const useModal = () => {
  // Функция для показа подтверждения (аналог window.confirm)
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      globalConfirmState.value = {
        show: true,
        loading: false,
        resolve,
        ...options,
      };
    });
  };

  // Функция для показа уведомления (аналог window.alert)
  const alert = (options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      globalAlertState.value = {
        show: true,
        loading: false,
        resolve: () => resolve(),
        ...options,
      };
    });
  };

  // Обработка подтверждения
  const handleConfirm = async () => {
    if (!globalConfirmState.value.resolve) return;

    globalConfirmState.value.loading = true;

    // Даем возможность выполнить асинхронные операции
    await nextTick();

    globalConfirmState.value.resolve(true);
    globalConfirmState.value.show = false;
    globalConfirmState.value.loading = false;
    globalConfirmState.value.resolve = undefined;
  };

  // Обработка отмены
  const handleCancel = () => {
    if (!globalConfirmState.value.resolve) return;

    globalConfirmState.value.resolve(false);
    globalConfirmState.value.show = false;
    globalConfirmState.value.loading = false;
    globalConfirmState.value.resolve = undefined;
  };

  // Обработка закрытия уведомления
  const handleAlertOk = () => {
    if (!globalAlertState.value.resolve) return;

    globalAlertState.value.resolve();
    globalAlertState.value.show = false;
    globalAlertState.value.loading = false;
    globalAlertState.value.resolve = undefined;
  };

  // Функции для установки состояния загрузки
  const setConfirmLoading = (loading: boolean) => {
    globalConfirmState.value.loading = loading;
  };

  return {
    // Глобальные состояния (теперь напрямую возвращаем ref-ы)
    confirmState: globalConfirmState,
    alertState: globalAlertState,

    // Методы
    confirm,
    alert,
    handleConfirm,
    handleCancel,
    handleAlertOk,
    setConfirmLoading,
  };
};
