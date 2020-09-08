import { useConfigs } from "../../stores/config-store/use-config-store";
import { useObserver } from "mobx-react-lite";

export const useClients = () => {
    const configStore = useConfigs();

    return useObserver(() => ({
        clients: configStore.clients,
        addAsync: configStore.clientsCollection.addAsync.bind(configStore),
        clientId: configStore.clientId,
        get: configStore.clientsCollection.get.bind(configStore.clientsCollection),
    }));
}