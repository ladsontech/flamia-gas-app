-- Add RLS policies for sub-admins with order management permissions

-- Allow users with manage_gas_orders or manage_shop_orders permissions to view all orders
CREATE POLICY "Sub-admins with order permissions can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_admin_permission(auth.uid(), 'manage_gas_orders') OR
  has_admin_permission(auth.uid(), 'manage_shop_orders')
);

-- Allow users with manage_gas_orders or manage_shop_orders permissions to update all orders
CREATE POLICY "Sub-admins with order permissions can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  has_admin_permission(auth.uid(), 'manage_gas_orders') OR
  has_admin_permission(auth.uid(), 'manage_shop_orders')
);

-- Allow users with manage_gas_orders or manage_shop_orders permissions to delete orders
CREATE POLICY "Sub-admins with order permissions can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (
  has_admin_permission(auth.uid(), 'manage_gas_orders') OR
  has_admin_permission(auth.uid(), 'manage_shop_orders')
);