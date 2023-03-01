import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { ZodType } from "zod";

export function useZodForm<TSchema extends ZodType>(
    props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> &
    { schema: TSchema }
) {
    const form = useForm<TSchema["_input"]>({
        ...props,
        resolver: zodResolver(props.schema, undefined)
    });
    return form
}