import ClientTodoComponent from "@/components/todos/client-component";
import ServerTodoComponent from "@/components/todos/server-component";

export default async function Index () {
    return (
        <>
        <ServerTodoComponent />
        <ClientTodoComponent />
        </>
    )
}